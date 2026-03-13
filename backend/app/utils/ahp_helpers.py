SAATY_SCALE_LABELS = {
    1: "Quan trọng bằng nhau",
    2: "Giữa bằng nhau và hơn vừa phải",
    3: "Quan trọng hơn vừa phải",
    4: "Giữa vừa phải và nhiều",
    5: "Quan trọng hơn nhiều",
    6: "Giữa nhiều và rất nhiều",
    7: "Quan trọng hơn rất nhiều",
    8: "Giữa rất nhiều và tuyệt đối",
    9: "Quan trọng hơn tuyệt đối",
}

MIN_ALTERNATIVES = 2
MAX_ALTERNATIVES = 7
MIN_CRITERIA = 2
MAX_CRITERIA = 10
CONSISTENCY_THRESHOLD = 0.1


def format_saaty_value(value: float) -> str:
    if value >= 1:
        int_val = int(value)
        return SAATY_SCALE_LABELS.get(int_val, f"Giá trị {int_val}")
    inverse = 1.0 / value
    int_inv = int(round(inverse))
    base_label = SAATY_SCALE_LABELS.get(int_inv, f"Giá trị {int_inv}")
    return f"Nghịch đảo: {base_label}"


def validate_saaty_value(value: float) -> bool:
    if value < 1 / 9 - 0.001 or value > 9 + 0.001:
        return False
    return True
