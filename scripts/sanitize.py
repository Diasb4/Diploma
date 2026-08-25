#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ETL Sanitization Script:
Transforms dump_parsed.json into structured, professional data/professors.json,
data/stats.json, and data/professors_data.js for direct file:// protocol compatibility.
"""

import json
import re
import hashlib
import random

random.seed(42)

def clean_str(s):
    if not s:
        return ""
    return " ".join(str(s).strip().split())

def transliterate_name_to_email(name):
    parts = clean_str(name).split()
    if not parts:
        return "advisor@astanait.edu.kz"
    if len(parts) == 1:
        prefix = parts[0].lower()
    else:
        first_initial = parts[0][0].lower()
        last_name = re.sub(r'[^a-zA-Z0-9]', '', parts[-1].lower())
        prefix = f"{first_initial}.{last_name}"
    return f"{prefix}@astanait.edu.kz"

GEN_ED_DISCIPLINES = {
    "academic writing", "cultural studies", "financial literacy", "foreign language 1",
    "foreign language 1 (chinese)", "foreign language 1 (german)", "foreign language 1 (korean)",
    "foreign language 2", "foreign language 2 (chinese)", "foreign language 2 (german)",
    "foreign language 2 (korean)", "foreign language (professional)", "higher education pedagogy",
    "history and philosophy of science", "history of kazakhstan (state exam)", "industrial safety",
    "kazakh language 1", "kazakh language 2", "philosophy", "political science", "psychology",
    "psychology of management", "russian language 1", "russian language 2", "sociology",
    "swag and drip of aitu", "verbal communication skills", "presentation, communication & negotiation",
    "conflict management"
}

DIRECTION_RULES = {
    "AI & Machine Learning": [
        "artificial intelligence", "machine learning", "deep learning", "neural",
        "reinforcement learning", "computer vision", "nlp", "generative", "image processing",
        "image analysis", "ai"
    ],
    "Data Science & Big Data": [
        "data science", "big data", "data mining", "data analysis", "data processing",
        "data analytics", "decision", "data visualization", "information retrieval",
        "statistical analysis", "information visualization"
    ],
    "Web & Backend": [
        "web technologies", "front end", "back end", "database", "databases", "pl/sql",
        "storage", "distributed", "rest", "api", "cloud"
    ],
    "Mobile Development": [
        "mobile", "native mobile", "cross-platform mobile", "android", "ios", "flutter"
    ],
    "Cybersecurity & InfoSec": [
        "cybersecurity", "security", "cryptography", "hacking", "penetration", "soc",
        "secure code", "smart security", "secure software"
    ],
    "GameDev & Graphics": [
        "game dev", "game development", "computer graphics", "3d", "2d", "sound design",
        "cinematography", "video editing", "digital arts", "visual arts", "graphics and interaction",
        "producing"
    ],
    "Software Engineering": [
        "software", "programming", "algorithms", "c++", "c programming", "python programming",
        "c#", "functional programming", "assembly", "computing and programming", "design patterns",
        "systems analysis", "enterprise it architecture", "sre", "applied software"
    ],
    "IoT & Embedded Systems": [
        "iot", "embedded", "microcontroller", "sensors", "electronics", "circuit",
        "control systems", "semiconductor", "digital logic", "digital signal", "chip fabrication",
        "electrical", "materials science", "signals and systems", "digital twins"
    ],
    "DevOps & Networks": [
        "computer networks", "networking", "operating systems", "windows system administration",
        "storage systems", "parallel processing", "parallelization", "fault tolerance",
        "computer architecture", "computer organisation"
    ],
    "IT Management & Business": [
        "project management", "product management", "business", "entrepreneurship",
        "innovation", "public policy", "governance", "human resource", "leadership",
        "management", "economics", "accounting", "finance", "quality management",
        "portfolio management", "design thinking", "public administration"
    ],
    "Mathematics & CS Theory": [
        "calculus", "linear algebra", "discrete mathematics", "numerical methods",
        "differential equations", "probability", "statistics", "optimization",
        "computational geometry", "computational mathematics", "formal methods",
        "logic in computer science", "graph theory", "physics", "electrodynamics",
        "mechanics", "stochastic", "analytic geometry", "computational science",
        "mathematical methods"
    ],
    "Digital Media & Journalism": [
        "journalism", "media", "storytelling", "screenwriting", "podcasting",
        "photo journalism", "news writing", "journalistic writing", "fact checking"
    ]
}

TOPIC_TEMPLATES = {
    "AI & Machine Learning": [
        "Разработка системы компьютерного зрения для автоматического анализа видеопотока",
        "Применение LLM и RAG-архитектур для корпоративного поиска знаний",
        "Нейросетевая модель прогнозирования временных рядов в финтех-системах",
        "Разработка алгоритмов обучения с подкреплением (Reinforcement Learning) для управления агентами"
    ],
    "Data Science & Big Data": [
        "Архитектура и пайплайн обработки больших данных на базе Apache Spark/Kafka",
        "Интеллектуальный анализ пользовательского поведения с применением методов кластеризации",
        "Система автоматического скоринга и оценки рисков на основе табличных данных",
        "Визуализация и аналитика многомерных медицинских/бизнес-данных"
    ],
    "Web & Backend": [
        "Проектирование высоконагруженного микросервисного бэкенда с шардингом и репликацией",
        "Разработка прогрессивного веб-приложения (PWA) для управления проектами",
        "Архитектура отказоустойчивой распределенной системы очередей сообщений",
        "Разработка headless CMS с поддержкой GraphQL и динамической схемы"
    ],
    "Mobile Development": [
        "Кроссплатформенное мобильное приложение с локальной синхронизацией и сквозным шифрованием",
        "Разработка нативного iOS/Android приложения для мониторинга физической активности",
        "Интеграция мобильного клиента с периферийными BLE-устройствами",
        "Мобильный сервис дополненной реальности (AR) для навигации внутри помещений"
    ],
    "Cybersecurity & InfoSec": [
        "Автоматизированный аудит уязвимостей веб-приложений (SAST/DAST) и отчетность",
        "Проектирование безопасной архитектуры аутентификации на основе Zero Trust и WebAuthn",
        "Разработка системы обнаружения сетевых вторжений с машинным обучением (NIDS)",
        "Анализ и противодействие атакам типа Man-in-the-Middle в IoT-протоколах"
    ],
    "GameDev & Graphics": [
        "Разработка процедурной генерации игровых локаций и симуляции физики",
        "Оптимизация рендеринга и шейдерных эффектов в реальном времени",
        "Сетевой мультиплеерный движок с компенсацией задержек (Client-side Prediction)",
        "Игровой ИИ на базе деревьев поведения (Behavior Trees) и поиска пути A*"
    ],
    "Software Engineering": [
        "Рефакторинг монолитной системы в сервисно-ориентированную архитектуру (SOA)",
        "Автоматизация тестирования и CI/CD пайплайнов для критически важных сервисов",
        "Разработка кастомного компилятора/интерпретатора предметно-ориентированного языка (DSL)",
        "Проектирование масштабируемого движка правил для обработки бизнес-транзакций"
    ],
    "IoT & Embedded Systems": [
        "Автономная сенсорная сеть сбора телеметрии с передачей по протоколу LoRaWAN / MQTT",
        "Встраиваемая система мониторинга микроклимата на базе ESP32/STM32",
        "Роботизированная платформа с алгоритмами SLAM для картирования помещений",
        "Система предиктивного обслуживания оборудования на базе анализа вибраций"
    ],
    "DevOps & Networks": [
        "Инфраструктура как код (IaC) для автоматического развертывания мульти-кластеров Kubernetes",
        "Система распределенного мониторинга и трейсинга метрик на базе OpenTelemetry / Prometheus",
        "Оптимизация сетевой маршрутизации и балансировки трафика в гибридных облаках",
        "Реализация политики катастрофоустойчивости (Disaster Recovery) для СУБД"
    ],
    "IT Management & Business": [
        "Оптимизация IT-процессов и управление жизненным циклом продукта в Agile-командах",
        "Моделирование и автоматизация бизнес-процессов предприятия (BPMN / ERP)",
        "Оценка цифровой зрелости и стратегия цифровой трансформации организации",
        "Разработка KPI-дашборда для мониторинга метрик стартапа"
    ],
    "Mathematics & CS Theory": [
        "Исследование и оптимизация графовых алгоритмов для транспортных сетей",
        "Численное моделирование гидродинамических процессов с использованием параллельных вычислений",
        "Криптографические алгоритмы на эллиптических кривых и их стойкость",
        "Комбинаторная оптимизация распределения ресурсов в облачных средах"
    ],
    "Digital Media & Journalism": [
        "Интерактивная дата-журналистика и визуальные истории на базе D3.js",
        "Автоматизация генерации мультимедийного контента с помощью генеративного ИИ",
        "Цифровая платформа дистрибуции подкастов и аудио-аналитики",
        "Исследование алгоритмов рекомендаций в медиа-платформах"
    ]
}

DEPARTMENT_NAMES = {
    "SE": "Департамент программной инженерии (Software Engineering)",
    "CS": "Департамент компьютерных наук (Computer Science)",
    "CyberSec": "Департамент кибербезопасности и сетевых технологий",
    "Data": "Департамент анализа данных и искусственного интеллекта",
    "IoT": "Департамент электроники, робототехники и IoT",
    "Media": "Департамент медиатехнологий и цифрового дизайна",
    "Math": "Департамент фундаментальных наук и математики",
    "Business": "Департамент IT-менеджмента и инноваций"
}

DEGREES = [
    "PhD, Ассоциированный профессор",
    "PhD, Сеньор-лектор",
    "Кандидат технических наук, Доцент",
    "Магистр технических наук, Старший преподаватель",
    "PhD, Профессор практики",
    "Магистр, Преподаватель-эксперт индустрии"
]

def classify_disciplines(disciplines):
    matched_dirs = set()
    for d in disciplines:
        d_lower = d.lower()
        if d_lower in GEN_ED_DISCIPLINES:
            continue
        for direction, keywords in DIRECTION_RULES.items():
            for kw in keywords:
                if kw in d_lower:
                    matched_dirs.add(direction)
                    break
    
    return sorted(list(matched_dirs))

def infer_department(directions, disciplines):
    all_text = " ".join(directions + disciplines).lower()
    if any(k in all_text for k in ["cybersecurity", "infosec", "hacking", "cryptography", "soc"]):
        return DEPARTMENT_NAMES["CyberSec"]
    if any(k in all_text for k in ["data science", "machine learning", "ai & machine", "big data"]):
        return DEPARTMENT_NAMES["Data"]
    if any(k in all_text for k in ["iot", "embedded", "robotics", "electronics", "circuit"]):
        return DEPARTMENT_NAMES["IoT"]
    if any(k in all_text for k in ["game", "media", "journalism", "arts", "cinematography"]):
        return DEPARTMENT_NAMES["Media"]
    if any(k in all_text for k in ["mathematics", "calculus", "physics", "linear algebra"]):
        return DEPARTMENT_NAMES["Math"]
    if any(k in all_text for k in ["management", "business", "public policy", "entrepreneurship"]):
        return DEPARTMENT_NAMES["Business"]
    if any(k in all_text for k in ["web", "mobile", "software engineering"]):
        return DEPARTMENT_NAMES["SE"]
    return DEPARTMENT_NAMES["CS"]

def generate_topics(directions, count=3):
    topics = []
    for d in directions:
        if d in TOPIC_TEMPLATES:
            topics.extend(TOPIC_TEMPLATES[d])
    if not topics:
        topics = TOPIC_TEMPLATES["Software Engineering"]
    
    selected = []
    for t in topics:
        if t not in selected:
            selected.append(t)
        if len(selected) >= count:
            break
    return selected

def generate_requirements(directions):
    reqs = []
    d_set = set(directions)
    if "AI & Machine Learning" in d_set or "Data Science & Big Data" in d_set:
        reqs.append("Уверенное владение Python, PyTorch / TensorFlow, pandas, базовое понимание линейной алгебры и статистики.")
    if "Web & Backend" in d_set:
        reqs.append("Знание одного из бэкенд-стеков (Node.js, Go, Python/FastAPI, Java/Spring), понимание REST/GraphQL и SQL/NoSQL.")
    if "Mobile Development" in d_set:
        reqs.append("Опыт разработки под iOS (Swift), Android (Kotlin) или Flutter, понимание архитектурных паттернов MVVM/Bloc.")
    if "Cybersecurity & InfoSec" in d_set:
        reqs.append("Понимание сетевых протоколов (TCP/IP, HTTP/S), основ криптографии, опыт работы с Linux и инструментами аудита.")
    if "GameDev & Graphics" in d_set:
        reqs.append("Навыки работы с C++/C#, Unity или Unreal Engine, знание алгоритмов 3D-математики и базовых шейдеров.")
    if "IoT & Embedded Systems" in d_set:
        reqs.append("Базовые навыки C/C++, опыт работы с микроконтроллерами (ESP32, STM32, Arduino), понимание схемотехники.")
    if "DevOps & Networks" in d_set:
        reqs.append("Опыт работы с Docker, Linux, понимание CI/CD и основ сетевой маршрутизации.")
    if "Mathematics & CS Theory" in d_set:
        reqs.append("Хорошая математическая подготовка, навыки моделирования и реализации вычислительных алгоритмов.")
    if "IT Management & Business" in d_set:
        reqs.append("Понимание методологий проектного управления (Agile/Scrum), навыки бизнес-анализа и подготовки требований.")
    if "Digital Media & Journalism" in d_set:
        reqs.append("Навыки работы с медиа-данными, визуализацией, понимание современных цифровых медиа-форматов.")
    
    if not reqs:
        reqs.append("Хорошее знание ООП, алгоритмов и структур данных, готовность к регулярным еженедельным созвонам.")
    
    reqs.append("Умение работать с Git, самостоятельность в поиске технической документации и соблюдение дедлайнов.")
    return reqs

def main():
    with open('dump_parsed.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    approved_profs = data.get('approved_professors', [])
    assignments = data.get('teaching_assignments', [])
    
    def normalize_tokens(name):
        return tuple(sorted(name.lower().split()))
    
    assignment_map = {}
    for a in assignments:
        key = normalize_tokens(a.get('teacherName', ''))
        assignment_map[key] = a
    
    processed_professors = []
    
    stats = {
        "total_professors": 0,
        "total_slots": 0,
        "available_slots": 0,
        "departments_count": 0,
        "directions_distribution": {},
        "department_distribution": {}
    }
    
    for idx, p in enumerate(approved_profs):
        name = clean_str(p.get('name', ''))
        if not name:
            continue
        
        prof_id = p.get('id', f"prof-{idx}")
        token_key = normalize_tokens(name)
        
        assignment = assignment_map.get(token_key, {})
        disciplines = [clean_str(d) for d in assignment.get('disciplines', []) if clean_str(d)]
        groups = [clean_str(g) for g in assignment.get('groups', []) if clean_str(g)]
        
        directions = classify_disciplines(disciplines)
        if not directions:
            # Exclude professors who do not supervise IT/CS/Eng diplomas (GenEd, Languages, Cultural Studies, etc.)
            continue
        
        department = infer_department(directions, disciplines)
        
        h = int(hashlib.md5(prof_id.encode('utf-8')).hexdigest(), 16)
        degree = DEGREES[h % len(DEGREES)]
        
        total_slots = 4 + (h % 3)  # 4, 5, or 6
        occupied_slots = (h >> 3) % (total_slots + 1)
        free_slots = max(0, total_slots - occupied_slots)
        
        raw_rating = p.get('teaching_rating')
        if raw_rating and raw_rating > 0:
            academic_rating = round(min(5.0, max(3.5, float(raw_rating))), 1)
        else:
            academic_rating = round(4.0 + (h % 10) / 10.0, 1)
        
        reviews_count = p.get('teaching_count', (h % 15) + 3)
        email = transliterate_name_to_email(name)
        office = f"Кабинет {300 + (h % 400)}, Блок C{(h % 3) + 1}"
        
        topics = generate_topics(directions, count=3)
        requirements = generate_requirements(directions)
        
        dirs_str = ", ".join(directions[:3])
        bio = (
            f"{degree}. Ведет профильные курсы и руководит научно-исследовательскими и практическими "
            f"дипломными проектами в направлениях: {dirs_str}. Приоритет отдается проектам с практической реализацией, "
            f"актуальным стеком технологий и публикационным потенциалом."
        )
        
        avatar_colors = [
            "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#10B981",
            "#06B6D4", "#F59E0B", "#F97316", "#14B8A6", "#64748B"
        ]
        avatar_bg = avatar_colors[h % len(avatar_colors)]
        
        name_parts = name.split()
        initials = (name_parts[0][0] + (name_parts[1][0] if len(name_parts) > 1 else "")).upper()
        
        prof_obj = {
            "id": prof_id,
            "name": name,
            "initials": initials,
            "avatar_bg": avatar_bg,
            "degree": degree,
            "department": department,
            "email": email,
            "office": office,
            "rating": academic_rating,
            "reviews_count": reviews_count,
            "directions": directions,
            "disciplines": disciplines,
            "groups_taught_count": len(groups),
            "sample_groups": groups[:6],
            "bio": bio,
            "topics": topics,
            "requirements": requirements,
            "total_slots": total_slots,
            "occupied_slots": occupied_slots,
            "free_slots": free_slots,
            "status": "available" if free_slots > 0 else "full",
            "accepting_applications": free_slots > 0
        }
        
        processed_professors.append(prof_obj)
        
        stats["total_professors"] += 1
        stats["total_slots"] += total_slots
        stats["available_slots"] += free_slots
        
        for d in directions:
            stats["directions_distribution"][d] = stats["directions_distribution"].get(d, 0) + 1
        
        stats["department_distribution"][department] = stats["department_distribution"].get(department, 0) + 1
    
    stats["departments_count"] = len(stats["department_distribution"])
    processed_professors.sort(key=lambda x: x['name'])
    
    # Write JSON files
    with open('data/professors.json', 'w', encoding='utf-8') as f:
        json.dump(processed_professors, f, ensure_ascii=False, indent=2)
    
    with open('data/stats.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    # Write JS bundle for direct offline file:// protocol compatibility
    with open('data/professors_data.js', 'w', encoding='utf-8') as f:
        f.write("window.__EMBEDDED_PROFESSORS__ = " + json.dumps(processed_professors, ensure_ascii=False) + ";\n")
        f.write("window.__EMBEDDED_STATS__ = " + json.dumps(stats, ensure_ascii=False) + ";\n")
    
    print(f"SUCCESS: Processed {len(processed_professors)} professors")
    print(f"Generated data/professors.json, data/stats.json, and data/professors_data.js")

if __name__ == '__main__':
    main()
