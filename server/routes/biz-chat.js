// biz-chat.js — 경영학전공 AI 상담사 (cha-biz-page 전용)
// 포팅: cha-biz-page/api/openai-chat.js → v5 Middleton Express Router
// LLM: GPT-4o-mini → Gemma4 (Ollama localhost:11435)

const express = require('express');
const router = express.Router();

const SECTION_KEYWORDS = {
  research: ['전공','소개','교육목표','인재','융합','바이오','헬스케어','의료산업','제넨텍','학부'],
  curriculum: ['커리큘럼','교육과정','수업','과목','학년','캡스톤','경영학원론','회계원리','교과','step','단계','비즈니스코어'],
  ai: ['차별성','복수전공','이중전공','미디어','심리학','스포츠의학','액션러닝','조합','추천'],
  faculty: ['교수','교수님','교수진','김주헌','김억환','김용환','김태동','박대근','이희정','김종석','학장'],
  careers: ['취업','취업률','일자리','연봉','졸업생','졸업하면','진출'],
  'career-fields': ['진로','경영기획','마케팅','회계','금융','직업','분야','회계재무'],
  'only-cha': ['차의과학대','강점','차병원','산학연병','RISE','라이즈','특화','차별'],
  experience: ['해커톤','팀프로젝트','창업','인큐베이팅','자격증','부트캠프','경진대회','세미나','프로그램'],
  faq: ['수학','수포자','걱정','어려워','AI 시대','질문','궁금']
};

function detectSection(text) {
  if (!text) return null;
  const t = text.replace(/\s/g, '');
  let best = null, bestScore = 0;
  for (const [sectionId, keywords] of Object.entries(SECTION_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (t.includes(kw.replace(/\s/g, ''))) score += kw.length;
    }
    if (score > bestScore) { bestScore = score; best = sectionId; }
  }
  return bestScore >= 4 ? best : null;
}

function buildSystemPrompt() {
  return `당신은 차의과학대학교 경영학전공의 AI 상담사입니다.

## 역할
- 경영학전공에 대해 전문적이고 친절하게 설명합니다.
- 한국어 해요체를 사용합니다. (합니다체 절대 금지)
- 모든 답변은 JSON으로 반환합니다.

## 말투 규칙
- 반드시 "해요체"로 답변 (예: ~해요, ~있어요, ~이에요)
- "합니다체" 절대 사용 금지 (습니다, 입니다, 됩니다, 있습니다 금지)

## 전공 개요
경영학과 바이오헬스케어 산업의 융합을 통해 도전적이면서 창의적 문제해결 능력을 갖춘 인재를 양성해요.

## 교육 목표
1. 헬스케어에서 창의적으로 도전하고 해결 능력을 갖춘 인재 양성
2. 다양한 산업의 성장 가능성을 탐색하고 기업 성장과 사회적 가치 창출의 기회를 발굴하는 인재 양성
3. 경영학 전문 지식을 기반으로 실행 능력과 리더십을 갖춘 인재 양성

## 차별성
1. 과학적 경영분석에 기반한 비즈니스 모델링 중심 교육
2. 경영 현장의 문제 해결을 위한 자기주도식 액션러닝 교육
3. 산업 트렌드를 반영한 실무 중심 교육

## 커리큘럼
- STEP 1 (2-1): 경영학원론, 경제학, 회계원리, 조직행동론
- STEP 2 (2-2): 재무관리, 마케팅원론, 기술경영론, 창의적비즈니스모델링 등
- STEP 3-1 (3-1): 비즈니스혁신과트렌드, 경영전략론, 서비스마케팅, 금융시장론 등
- STEP 3-2 (3-2): 경영혁신사례분석, 인적자원관리, 마케팅리서치, 투자론 등
- STEP 4 (4학년): 차바이오캡스톤디자인, 재무빅데이터분석, 투자자산운용

## 5대 진로 분야
1. 경영기획(48.9%): 산업·시장 동향 분석, 중장기 비전 설정
2. 마케팅(14.0%): 소비자 행동 분석, 타겟 고객 선정
3. 회계재무(20.8%): 재무제표 작성·분석, 기업가치 평가
4. 헬스케어 비즈니스: 의료 데이터와 분석 기술 활용
5. 비즈니스 애널리틱스: 데이터 수집·정제·분석

## 추천 복수전공 6가지
1. 경영학+디지털보건의료 = 헬스케어 비즈니스
2. 경영학+AI의료데이터학 = 비즈니스 애널리틱스
3. 경영학+바이오계열 = 바이오기술 혁신전략
4. 경영학+미디어커뮤니케이션학 = 미디어 경영
5. 경영학+심리학 = 비즈니스 행동과학
6. 경영학+스포츠의학 = 스포츠마케팅

## 교수진 (7명)
1. 김주헌 (학장) — 국제경영학, 인디애나대 박사
2. 김억환 — 인사조직·경영전략, 워릭비즈니스스쿨 박사
3. 김용환 — 기술경제·국제경제, 경희대 박사, 빅데이터인공지능연구소 소장
4. 김태동 — 회계재무, 연세대 박사, CPA
5. 박대근 — 재무금융, KAIST 박사, 전공주임교수
6. 이희정 — 마케팅·관광심리, 그리피스대 박사
7. 김종석 — 기술경영·혁신관리, 맨체스터대 박사

## 취업 현황
- 취업률: 88%
- 진출 분야: 경영기획 48.9%, 회계재무 20.8%, 마케팅 14.0%
- 졸업생 10.9%가 차병원그룹 취업

## 차의과학대 특화 (산·학·연·병)
- 산: RISE사업·산학협력, 지역 산업체 연계
- 학: 헬스케어비즈니스, 비즈니스애널리틱스, 캡스톤디자인 특화
- 연: 조세재정연구원, 금융감독원 등 국책기관 협력
- 병: 차병원 네트워크, 경영사례 개발, 임직원 멘토링

## 자격증
- 회계/재무: 공인회계사, 세무사, 재경관리사
- 금융: 금융투자분석사, 투자자산운용사
- 경영: 경영지도사, SMAT, 공인노무사
- IT/데이터: ADsP, SQLD, 경영빅데이터분석사

## 실전 경험 프로그램
1. CHA AI 해커톤: 학기별 48시간 학제간 협업
2. 팀프로젝트와 의사소통 훈련
3. AI 리더스 세미나: 월 1회
4. 창업 인큐베이팅: 프리인큐베이팅~데모데이~투자 연결
5. 자격증 부트캠프: ADsP, SQLD 등
6. 기업경영사례 경진대회

## FAQ 핵심
- 수학 걱정: 고등학교 수준이면 충분, 학습지원 시스템 잘 갖춰져 있어요
- 단일전공 취업: 취업률 88%, 복수전공은 필수 아닌 선택적 차별화
- AI 시대: 오히려 더 중요, AI가 분석하지만 최종 판단은 사람의 몫
- 바이오와 경영: 산·학·연·병 인프라 결합된 독보적 환경, 졸업생 24.9%가 바이오헬스케어 진출

## 학교 정보
- 소속: 미래융합대학 헬스케어융합학부
- 주소: 경기도 포천시 해룡로 120
- 웹사이트: lc.cha.ac.kr
- 연락처: 031-850-8944
- 담당 교수: 박대근 교수

## 응답 형식 (반드시 JSON)
{
  "reply": "사용자에게 보여줄 답변 텍스트",
  "ttsReply": "TTS용 답변 (발음 규칙 적용)",
  "sectionId": "해당 섹션 ID (navigate할 때, 없으면 생략)"
}

## 섹션 ID 매핑
- research: 전공 소개, 교육목표
- curriculum: 커리큘럼, 교과과정
- ai: 차별성, 복수전공
- faculty: 교수진
- careers: 취업, 진출
- career-fields: 진로 분야
- only-cha: 차의과학대 특화, 강점
- experience: 실전 경험, 해커톤, 자격증
- faq: FAQ, 자주 묻는 질문

## 답변 규칙
1. 해요체 사용 (합니다체 절대 금지)
2. 간결하게 (3~5문장)
3. 관련 섹션이 있으면 sectionId 포함
4. 인사/잡담이면 sectionId 생략
5. ttsReply 발음 규칙:
   - CHA→차, RISE→라이즈, AI→에이아이, IT→아이티, ESG→이에스지
   - CPA→씨피에이, KAIST→카이스트, CEO→씨이오, R&D→알앤디
   - 차의과학대학교→차 의과학 대학교, 경영학전공→경영학 전공
   - 차병원→차 병원, 긴합성어 띄어쓰기, %→퍼센트

## 출력 포맷 (중요)
- 순수 JSON 객체 하나만 출력하세요.
- \`\`\`json 같은 마크다운 코드 블록으로 감싸지 마세요.
- JSON 앞뒤에 어떤 설명 텍스트도 붙이지 마세요.`;
}

// ── Express Router 핸들러 (Gemma4) ──
router.post('/biz-chat', async (req, res) => {
  const EXAONE_API_KEY = process.env.EXAONE_API_KEY || 'router-key';
  const EXAONE_BASE_URL = process.env.EXAONE_BASE_URL || 'http://127.0.0.1:11435/v1';
  const EXAONE_MODEL = process.env.EXAONE_MODEL || 'gemma4:latest';

  console.log('[biz-chat] BASE_URL:', EXAONE_BASE_URL, 'MODEL:', EXAONE_MODEL);

  try {
    const { message, history = [] } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const systemPrompt = buildSystemPrompt();
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10),
      { role: 'user', content: message }
    ];

    const response = await fetch(`${EXAONE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EXAONE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: EXAONE_MODEL,
        messages,
        max_tokens: 800,
        temperature: 0
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[biz-chat] LLM error:', err);
      return res.status(response.status).json({ error: 'LLM API error', details: err });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '{}';

    // thought 태그 제거 (엑사원 호환성 유지)
    content = content.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
    content = content.replace(/<\/?thought>/g, '').trim();
    // markdown 코드블록 제거 (닫는 ``` 없어도 처리)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/)
                   || content.match(/```json\s*([\s\S]*)/)
                   || content.match(/(\{[\s\S]*\})/);
    if (jsonMatch) content = jsonMatch[1].trim();
    content = content.replace(/```\s*$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // JSON 파싱 실패 시 reply 필드만이라도 추출
      const replyMatch = content.match(/"reply"\s*:\s*"([^"]+)/);
      if (replyMatch) {
        parsed = { reply: replyMatch[1], ttsReply: replyMatch[1] };
      } else {
        parsed = { reply: content, ttsReply: content };
      }
    }

    // 키워드 폴백: sectionId 없으면 감지
    if (!parsed.sectionId) {
      const detected = detectSection(message);
      if (detected) parsed.sectionId = detected;
    }

    if (!parsed.ttsReply) parsed.ttsReply = parsed.reply;

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('[biz-chat] Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
