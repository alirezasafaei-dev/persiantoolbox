# Content System — PersianToolbox Growth

**Version**: 1.0  
**Created**: 2026-08-08

---

## Content Engine Overview

The content system produces consistent, measurable social content that drives traffic to PersianToolbox tools.

### Core Principle

Every content item maps to:
1. **User Problem** → What pain point?
2. **Hero Cluster** → Which tool cluster?
3. **Content Angle** → What unique perspective?
4. **CTA** → What action?
5. **Destination** → Where does it lead?
6. **Measurement** → How do we measure success?

---

## Content Types

### Reels (Instagram)

**Cadence**: Daily (30/month)  
**Duration**: 8-10 seconds  
**Format**: Vertical 9:16

#### Structure

```
0-2 sec: Strong problem-first hook
2-5 sec: Mistake / tension / clarification
5-8 sec: Solution / tool / result
8-10 sec: One CTA
```

#### Hook Templates

1. **Problem-First**: "میدونستی [problem] رو میتونی [solution] کنی؟"
2. **MakeAngle**: "این اشتباه رو [context] نکن"
3. **Before/After**: "قبلاً [old way]... حالا [new way]"
4. **Privacy**: "فایلت هیچ‌جا آپلود نمیشه"
5. **Speed**: "تو [time] ثانیه انجامش بده"

#### CTA Library

- "ذخیره کن" (Save this)
- "برای کسی بفرست که بهش نیاز داره" (Send it to someone who needs it)
- "ابزار را امتحان کن" (Use the tool)
- "لینک در بیو" (Link in bio)
- "جستجو کن: جعبه ابزار فارسی + نام ابزار" (Search: PersianToolbox + tool name)

---

### Carousels (Instagram)

**Cadence**: ~3/week (10/month)  
**Format**: Square or 4:5

#### Structures

1. **Step-by-Step**: "۳ قدم تا [result]"
2. **Mistakes**: "۳ اشتباه رایج در [task]"
3. **Checklist**: "چک‌لیست [task]"
4. **Comparison**: "قبل vs بعد"
5. **FAQ**: "سوالات متداول [tool]"
6. **Myth vs Reality**: "باور غلط vs واقعیت"

---

### Stories (Instagram)

**Cadence**: Daily (30/month)  
**Format**: Vertical 9:16, 15 seconds max

#### Types

1. **Poll**: "کدوم ابزار رو بیشتر استفاده میکنید؟"
2. **Quiz**: "میدونستی [fact]؟"
3. **Before/After**: Quick transformation
4. **Quick Tip**: "نکته سریع: [tip]"
5. **Tool Link**: Direct link to tool
6. **Behind-the-scenes**: Rose creating content
7. **User Question**: Answering audience questions

---

### Telegram Posts

**Cadence**: 3-5/week  
**Format**: Text + image/link

#### Types

1. **Tool Highlight**: Feature a specific tool
2. **Tutorial**: Step-by-step guide
3. **Tip**: Quick productivity tip
4. **Update**: New tool/feature announcement
5. **Discussion**: Ask audience questions

---

## Content Queue System

### 30-Day Reel Calendar

Location: `docs/growth/content-queue/reels-30day.md`

Structure:
```markdown
# 30-Day Reel Queue

## Week 1: [Theme]

### Day 1 — [Tool Cluster]
- **Hook**: [hook text]
- **Problem**: [user problem]
- **Solution**: [tool solution]
- **CTA**: [call to action]
- **Destination**: [tool URL]
- **UTM**: [full UTM URL]

### Day 2 — [Tool Cluster]
...
```

### Carousel Queue

Location: `docs/growth/content-queue/carousels.md`

### Story Queue

Location: `docs/growth/content-queue/stories.md`

---

## Content Production Workflow

### Daily (Rose + Developer)

1. **Morning**: Check content queue for today's items
2. **Create**: Produce Reel/Story/Carousel
3. **Review**: Verify character consistency
4. **Publish**: Post to Instagram/Telegram
5. **Track**: Record UTM links and performance

### Weekly (Developer)

1. **Analyze**: Review content performance
2. **Optimize**: Adjust queue based on results
3. **Plan**: Prepare next week's content
4. **Report**: Update weekly scorecard

---

## Content-to-Tool Mapping

| Tool Cluster | Content Angles | Priority |
|--------------|----------------|----------|
| PDF Tools | Compression, merge, split, page numbers | High |
| Finance Tools | Salary, loan, tax, interest | High |
| Date Tools | Shamsi-Gregorian, date difference | Medium |
| Address Tools | Persian to English address | High |
| OCR Tools | Persian text recognition | Medium |
| Document Tools | Invoice, receipt, resume | Medium |
| Writing Tools | Persian editor, ZWNJ, word count | Low |

---

## Quality Checklist

Before publishing any content:

- [ ] Rose character consistency (face, hair, glasses)
- [ ] Persian language accuracy
- [ ] CTA is clear and actionable
- [ ] UTM parameters are correct
- [ ] Destination URL is working
- [ ] Tool functionality is verified
- [ ] Privacy claims are accurate
- [ ] No sensitive user data is shown

---

## Performance Tracking

### Metrics to Track

| Metric | Target | Source |
|--------|--------|--------|
| Reach | >1000/reel | Instagram Insights |
| Saves | >50/reel | Instagram Insights |
| Shares | >20/reel | Instagram Insights |
| Link Clicks | >10/reel | Instagram Insights |
| Profile Visits | >100/week | Instagram Insights |
| Follows | >50/week | Instagram Insights |

### Weekly Report

Location: `docs/growth/weekly-scorecards/YYYY-WXX.md`

---

## Content Adaptation Loop

### After Week 1

1. **Rank** content by performance
2. **Identify** winning topics/angles
3. **Expand** winning clusters with new angles
4. **Pause** low-performing topics
5. **Test** new hooks for underperformers

### Winning Topic Expansion

Same tool + different pain point:
- "محاسبه حقوق" → "محاسبه مالیات حقوق"
- "فشرده‌سازی PDF" → "ادغام PDF"
- "تبدیل تاریخ" → "محاسبه سن"

Same problem + different hook:
- Problem-first → Mistake angle
- Before/after → Speed angle
- Privacy → Comparison angle

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-08 | Initial content system |
