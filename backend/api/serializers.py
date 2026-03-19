from rest_framework import serializers
from .models import Puzzle, Clue, Attempt, Teacher, Student
from .crossword_layout import build_grid_from_clues

class ClueSerializer(serializers.ModelSerializer):
    answer_length = serializers.SerializerMethodField()
    clue = serializers.CharField(source='question', read_only=True)
    number = serializers.SerializerMethodField()
    answer = serializers.SerializerMethodField()
    row = serializers.SerializerMethodField()
    col = serializers.SerializerMethodField()

    class Meta:
        model = Clue
        fields = ['id', 'clue', 'question', 'answer', 'answer_length', 'row', 'col', 'direction', 'number']

    def get_answer_length(self, obj):
        return len(obj.answer or "")

    def get_number(self, obj):
        return self.context.get("clue_numbers", {}).get(obj.id)

    def get_row(self, obj):
        return self.context.get("clue_coords", {}).get(obj.id, (obj.row, obj.col))[0]

    def get_col(self, obj):
        return self.context.get("clue_coords", {}).get(obj.id, (obj.row, obj.col))[1]

    def get_answer(self, obj):
        role = self.context.get("role", "Student")
        return obj.answer if role == "Teacher" else None

class PuzzleSerializer(serializers.ModelSerializer):
    clues = serializers.SerializerMethodField()
    points = serializers.SerializerMethodField()
    teacher_id = serializers.CharField(source='teacher.teacher_id', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    clue_count = serializers.SerializerMethodField()
    grid_size = serializers.SerializerMethodField()
    cells = serializers.SerializerMethodField()
    across = serializers.SerializerMethodField()
    down = serializers.SerializerMethodField()

    class Meta:
        model = Puzzle
        fields = [
            'id',
            'title',
            'teacher_id',
            'teacher_name',
            'attempts',
            'points',
            'status',
            'difficulty',
            'validation_mode',
            'created_at',
            'clue_count',
            'grid_size',
            'cells',
            'clues',
            'across',
            'down',
        ]

    def get_points(self, obj):
        return f"{obj.points:.0f}%"

    def get_clue_count(self, obj):
        return obj.clues.count()

    def _grid_data(self, obj):
        if not hasattr(obj, "_cached_grid_data"):
            obj._cached_grid_data = build_grid_from_clues(obj.clues.all())
        return obj._cached_grid_data

    def get_grid_size(self, obj):
        return self._grid_data(obj)[0]

    def get_cells(self, obj):
        return self._grid_data(obj)[1]

    def get_clues(self, obj):
        _, _, clue_number_by_id, clue_coords_by_id = self._grid_data(obj)
        serializer = ClueSerializer(
            obj.clues.all(),
            many=True,
            context={
                **self.context,
                "clue_numbers": clue_number_by_id,
                "clue_coords": clue_coords_by_id,
            },
        )
        return serializer.data

    def _clues_grouped(self, obj):
        clues = self.get_clues(obj)
        across = []
        down = []
        for clue in clues:
            item = {
                "id": clue["id"],
                "number": clue["number"],
                "clue": clue["clue"],
                "row": clue["row"],
                "col": clue["col"],
                "answer_length": clue["answer_length"],
                "length": clue["answer_length"],
                "direction": clue["direction"],
            }
            if clue["direction"] == "across":
                across.append(item)
            else:
                down.append(item)
        across.sort(key=lambda c: (c["number"], c["row"], c["col"]))
        down.sort(key=lambda c: (c["number"], c["row"], c["col"]))
        return across, down

    def get_across(self, obj):
        return self._clues_grouped(obj)[0]

    def get_down(self, obj):
        return self._clues_grouped(obj)[1]

class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = '__all__'


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'teacher_id', 'name']


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'reg_no', 'name']
