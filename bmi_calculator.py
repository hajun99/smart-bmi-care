def classify_bmi(bmi):
    if bmi < 18.5:
        return {
            "category": "저체중",
            "risk": "에너지 부족이나 근육량 감소에 주의하세요.",
            "exercise": "가벼운 근력 운동을 주 2~3회 하고, 걷기는 20분부터 시작하는 것을 추천합니다.",
            "meal": "주식, 단백질, 좋은 지방을 거르지 말고 간식으로 견과류나 요거트를 더해 보세요.",
        }

    if bmi < 25:
        return {
            "category": "정상 체중",
            "risk": "건강한 범위입니다. 현재 생활 습관을 잘 유지하세요.",
            "exercise": "유산소 운동을 주 150분 정도 하고, 스쿼트 같은 근력 운동을 주 2회 추가하면 좋습니다.",
            "meal": "채소, 단백질, 탄수화물을 매 끼니 균형 있게 챙기고 늦은 밤 고지방 음식은 줄이세요.",
        }

    if bmi < 30:
        return {
            "category": "비만 1단계",
            "risk": "체중 관리를 시작하기 좋은 단계입니다.",
            "exercise": "무릎 부담이 적은 빠르게 걷기, 실내 자전거, 수중 운동을 30분씩 주 3회부터 시작하세요.",
            "meal": "튀김과 단 음료를 줄이고, 저녁에는 채소와 단백질을 먼저 먹는 구성을 추천합니다.",
        }

    if bmi < 35:
        return {
            "category": "비만 2단계",
            "risk": "생활 습관병 위험에 주의가 필요합니다.",
            "exercise": "먼저 하루 2회, 10분 산책부터 시작하세요. 익숙해지면 낮은 강도의 근력 운동을 추가하세요.",
            "meal": "주식의 양을 조절하고 가공식품을 줄이며 생선, 콩류, 닭고기 중심으로 구성하세요.",
        }

    if bmi < 40:
        return {
            "category": "비만 3단계",
            "risk": "무리한 운동보다 안전한 체중 관리 계획이 중요합니다.",
            "exercise": "관절 부담이 적은 수중 걷기나 의자를 활용한 운동부터 시작하고, 필요하면 전문가와 상담하세요.",
            "meal": "극단적인 제한은 피하고 식사 기록을 작성하면서 섭취량과 간식 빈도를 조절하세요.",
        }

    return {
        "category": "비만 4단계",
        "risk": "의료적 지원도 함께 검토하는 것이 좋은 범위입니다.",
        "exercise": "스스로 강한 운동을 시작하지 말고 의사나 전문가와 안전한 운동량을 정하세요.",
        "meal": "갑작스러운 식사 제한보다는 전문가와 함께 지속 가능한 식단 계획을 세우는 것을 추천합니다.",
    }


def calculate_bmi_result(data):
    height = float(data["height"])
    weight = float(data["weight"])
    age = int(data["age"])
    gender = data["gender"]
    activity = float(data["activity"])

    if height <= 0 or weight <= 0 or age <= 0:
        raise ValueError("키, 몸무게, 나이는 0보다 큰 값을 입력하세요.")

    height_meters = height / 100
    bmi = weight / (height_meters**2)

    if gender == "male":
        base_calories = 10 * weight + 6.25 * height - 5 * age + 5
    elif gender == "female":
        base_calories = 10 * weight + 6.25 * height - 5 * age - 161
    else:
        raise ValueError("성별 값이 올바르지 않습니다.")

    calories = round(base_calories * activity)
    classification = classify_bmi(bmi)

    return {
        "bmi": round(bmi, 1),
        "calories": calories,
        **classification,
    }