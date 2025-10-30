package internal

import (
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	"gorm.io/gorm"
)

// BlogGeneratorTopics contains IELTS-related blog topics
type BlogGeneratorTopic struct {
	EnglishTitle      string
	IndonesianTitle   string
	EnglishContent    string
	IndonesianContent string
	Category          string
	Tags              []string
}

// GenerateBlogPosts generates blog posts using AI (or predefined templates for MVP)
func GenerateBlogPosts(db *gorm.DB) error {
	topics := getIELTSTopics()

	// Select a random topic
	topic := topics[rand.Intn(len(topics))]

	// Generate English post
	englishSlug := generateSlug(topic.EnglishTitle)
	englishPost := BlogPost{
		Title:       topic.EnglishTitle,
		Slug:        englishSlug,
		Excerpt:     extractExcerpt(topic.EnglishContent),
		Content:     topic.EnglishContent,
		Category:    topic.Category,
		Tags:        strings.Join(topic.Tags, ","),
		ReadTime:    estimateReadTime(topic.EnglishContent),
		IsPublished: true,
		PublishedAt: ptrTime(time.Now()),
		AuthorID:    1, // Default admin user
	}

	// Check if post with this slug already exists
	var existingPost BlogPost
	if err := db.Where("slug = ?", englishSlug).First(&existingPost).Error; err == gorm.ErrRecordNotFound {
		if err := db.Create(&englishPost).Error; err != nil {
			return fmt.Errorf("failed to create English blog post: %w", err)
		}
		log.Printf("Created English blog post: %s", englishPost.Title)
	}

	// Generate Indonesian post
	indonesianSlug := generateSlug(topic.IndonesianTitle)
	indonesianPost := BlogPost{
		Title:       topic.IndonesianTitle,
		Slug:        indonesianSlug,
		Excerpt:     extractExcerpt(topic.IndonesianContent),
		Content:     topic.IndonesianContent,
		Category:    topic.Category,
		Tags:        strings.Join(topic.Tags, ","),
		ReadTime:    estimateReadTime(topic.IndonesianContent),
		IsPublished: true,
		PublishedAt: ptrTime(time.Now()),
		AuthorID:    1, // Default admin user
	}

	if err := db.Where("slug = ?", indonesianSlug).First(&existingPost).Error; err == gorm.ErrRecordNotFound {
		if err := db.Create(&indonesianPost).Error; err != nil {
			return fmt.Errorf("failed to create Indonesian blog post: %w", err)
		}
		log.Printf("Created Indonesian blog post: %s", indonesianPost.Title)
	}

	return nil
}

// StartBlogGenerationCron starts the daily blog generation cronjob
func StartBlogGenerationCron(db *gorm.DB) {
	go func() {
		for {
			// Calculate time until next scheduled generation (e.g., 2 AM daily)
			now := time.Now()
			next := now.Add(24 * time.Hour)
			next = time.Date(next.Year(), next.Month(), next.Day(), 2, 0, 0, 0, next.Location())

			duration := next.Sub(now)
			log.Printf("Next blog generation scheduled for: %s (in %v)", next.Format("2006-01-02 15:04:05"), duration)

			time.Sleep(duration)

			if err := GenerateBlogPosts(db); err != nil {
				log.Printf("Error generating blog posts: %v", err)
			}
		}
	}()
}

func getIELTSTopics() []BlogGeneratorTopic {
	return []BlogGeneratorTopic{
		{
			EnglishTitle:    "Common IELTS Writing Mistakes and How to Avoid Them",
			IndonesianTitle: "Kesalahan Umum IELTS Writing dan Cara Menghindarinya",
			EnglishContent: `# Common IELTS Writing Mistakes and How to Avoid Them

IELTS writing can be challenging, but many candidates make preventable mistakes that cost them valuable band points. Let's explore the most common pitfalls and practical solutions.

## 1. Task Non-Completion

**Mistake:** Not fully addressing all parts of the question.
**Impact:** Significant loss of marks in Task Achievement.

**Solution:**
- Underline all parts of the task before you start writing
- Create a mental checklist to tick off each part
- Review your draft against each task requirement

## 2. Poor Time Management

**Mistake:** Spending too much time on Task 1, leaving insufficient time for Task 2.
**Impact:** Rushed writing with more errors and less developed ideas.

**Solution:**
- Task 1: Maximum 20 minutes
- Task 2: Minimum 40 minutes (it carries more weight)
- Practice with a timer to build speed

## 3. Unclear Position or Argument

**Mistake:** Not clearly stating your opinion or argument in the introduction.
**Impact:** Confused examiners and lower Task Achievement scores.

**Solution:**
- Write a clear thesis statement in your introduction
- Maintain consistent position throughout the essay
- Return to your position in the conclusion

## 4. Repetition and Redundancy

**Mistake:** Using the same words and phrases repeatedly.
**Impact:** Lower Lexical Resource score.

**Solution:**
- Use synonyms and paraphrasing
- Vary your sentence structures
- Employ different linking words

## 5. Lack of Supporting Examples

**Mistake:** Making claims without evidence or examples.
**Impact:** Lower Task Achievement and Coherence scores.

**Solution:**
- Provide at least one specific example per main point
- Use real-world examples or hypothetical scenarios
- Explain how your example supports your argument

## 6. Grammatical Errors

**Mistake:** Subject-verb disagreement, incorrect tenses, fragment sentences.
**Impact:** Lower Grammatical Range and Accuracy score.

**Solution:**
- Review common errors you make
- Leave time for proofreading (2-3 minutes minimum)
- Focus on accuracy over complexity

## 7. Ignoring Word Count Requirements

**Mistake:** Writing significantly below or above the word count.
**Impact:** Penalty in marks or inability to develop ideas fully.

**Solution:**
- Task 1: Minimum 150 words
- Task 2: Minimum 250 words
- Develop your ideas rather than fluff

## Tips for Success

1. **Practice regularly** - Set aside time for weekly writing practice
2. **Get feedback** - Use AI tools or professional feedback services
3. **Read your work aloud** - Catch errors and awkward phrasing
4. **Study Band 8 samples** - Understand what excellence looks like
5. **Time yourself** - Simulate exam conditions

Start avoiding these mistakes today and watch your band score improve!`,
			IndonesianContent: `# Kesalahan Umum IELTS Writing dan Cara Menghindarinya

Menulis IELTS memang menantang, tetapi banyak peserta membuat kesalahan yang dapat dihindari dan merugikan nilai band mereka. Mari kita pelajari jebakan paling umum dan solusi praktisnya.

## 1. Tidak Menyelesaikan Tugas Sepenuhnya

**Kesalahan:** Tidak sepenuhnya menjawab semua bagian pertanyaan.
**Dampak:** Kehilangan nilai signifikan dalam Task Achievement.

**Solusi:**
- Garis bawahi semua bagian tugas sebelum mulai menulis
- Buat daftar mental untuk menandai setiap bagian
- Tinjau draft Anda terhadap setiap persyaratan tugas

## 2. Manajemen Waktu yang Buruk

**Kesalahan:** Menghabiskan terlalu banyak waktu untuk Task 1, menyisakan waktu tidak cukup untuk Task 2.
**Dampak:** Tulisan yang tergesa-gesa dengan lebih banyak kesalahan dan ide yang kurang berkembang.

**Solusi:**
- Task 1: Maksimal 20 menit
- Task 2: Minimal 40 menit (ini membawa bobot lebih)
- Berlatih dengan pengatur waktu untuk meningkatkan kecepatan

## 3. Posisi atau Argumen yang Tidak Jelas

**Kesalahan:** Tidak dengan jelas menyatakan pendapat atau argumen Anda di pengenalan.
**Dampak:** Pemeriksa yang bingung dan skor Task Achievement yang lebih rendah.

**Solusi:**
- Tulis pernyataan tesis yang jelas di pengenalan Anda
- Pertahankan posisi yang konsisten di seluruh esai
- Kembali ke posisi Anda di kesimpulan

## 4. Pengulangan dan Redundansi

**Kesalahan:** Menggunakan kata dan frasa yang sama berulang kali.
**Dampak:** Skor Lexical Resource yang lebih rendah.

**Solusi:**
- Gunakan sinonim dan parafrase
- Ubah struktur kalimat Anda
- Gunakan kata sambung yang berbeda

## 5. Kurangnya Contoh Pendukung

**Kesalahan:** Membuat klaim tanpa bukti atau contoh.
**Dampak:** Skor Task Achievement dan Coherence yang lebih rendah.

**Solusi:**
- Berikan setidaknya satu contoh spesifik per poin utama
- Gunakan contoh dunia nyata atau skenario hipotetis
- Jelaskan bagaimana contoh Anda mendukung argumen Anda

## 6. Kesalahan Tata Bahasa

**Kesalahan:** Ketidaksesuaian subjek-kata kerja, tense yang salah, kalimat fragmen.
**Dampak:** Skor Grammatical Range and Accuracy yang lebih rendah.

**Solusi:**
- Tinjau kesalahan umum yang Anda buat
- Sisakan waktu untuk koreksi (minimal 2-3 menit)
- Fokus pada akurasi daripada kompleksitas

## 7. Mengabaikan Persyaratan Jumlah Kata

**Kesalahan:** Menulis jauh di bawah atau di atas persyaratan jumlah kata.
**Dampak:** Penalti dalam nilai atau ketidakmampuan mengembangkan ide sepenuhnya.

**Solusi:**
- Task 1: Minimum 150 kata
- Task 2: Minimum 250 kata
- Kembangkan ide Anda daripada isian

## Kiat untuk Sukses

1. **Berlatih secara teratur** - Sisihkan waktu untuk latihan menulis mingguan
2. **Dapatkan umpan balik** - Gunakan alat AI atau layanan umpan balik profesional
3. **Baca pekerjaan Anda dengan keras** - Tangkap kesalahan dan frase yang canggung
4. **Pelajari sampel Band 8** - Pahami seperti apa keunggulan itu
5. **Atur waktu Anda** - Simulasikan kondisi ujian

Mulai hindari kesalahan ini hari ini dan saksikan skor band Anda meningkat!`,
			Category: "Tips",
			Tags:     []string{"writing-tips", "mistakes", "band-improvement"},
		},
		{
			EnglishTitle:    "IELTS Vocabulary Building: From Band 6 to Band 8",
			IndonesianTitle: "Membangun Kosakata IELTS: Dari Band 6 ke Band 8",
			EnglishContent: `# IELTS Vocabulary Building: From Band 6 to Band 8

Vocabulary is crucial for achieving a high band score in IELTS. Moving from Band 6 to Band 8 requires not just knowing more words, but using them precisely and naturally.

## What Changes Between Band Levels?

### Band 6 Vocabulary
- Basic, common words
- Limited range
- Occasional inaccuracies
- Simple collocations

### Band 7 Vocabulary
- Wider range of common words
- Less frequent, more sophisticated words
- Generally accurate use
- Appropriate collocations in most cases

### Band 8 Vocabulary
- Wide range of vocabulary
- Natural use of less common words
- Precise meanings
- Consistent, sophisticated collocations

## Key Strategies for Vocabulary Improvement

### 1. Learn Word Families
Don't just learn individual words. Learn related forms:
- **Educate** (verb) → Education (noun) → Educational (adjective) → Educator (noun)
- **Analyze** (verb) → Analysis (noun) → Analytical (adjective) → Analytically (adverb)

### 2. Study Collocations
Words often go together in specific ways:
- **Strong** influence, **strong** argument, **strong** evidence (not weak influence)
- **Raise** awareness, **raise** concerns, **raise** issues

### 3. Use Synonyms and Antonyms
Expand your vocabulary with related words:
- **Problem** → Issue, Challenge, Difficulty, Obstacle
- **Good** → Excellent, Positive, Beneficial, Advantageous

### 4. Practice Contextual Use
Learn words in sentences, not in isolation:
- Instead of: "ambitious" (adjective)
- Learn: "ambitious goals," "ambitious person," "ambitiously pursuing"

## Common IELTS Vocabulary Mistakes

**Mistake 1:** Using informal words in formal writing
- ❌ "A lot of people think..."
- ✅ "Many individuals believe..."

**Mistake 2:** Incorrectly applying sophisticated words
- ❌ "The company's profit was devastating" (should be "decline" or "drop")
- ✅ "The company's profit showed a significant decline"

**Mistake 3:** Over-using the same vocabulary
- ❌ Repeating "important" multiple times
- ✅ Using synonyms: "crucial," "significant," "essential," "vital"

## Vocabulary Building Resources

- Academic word list (570 words covering 90% of academic texts)
- IELTS-specific vocabulary lists
- Collocations dictionaries
- Reading practice materials

## Daily Practice Routine

**Day 1:** Learn 5-10 new words in context
**Day 2:** Practice using them in sentences
**Day 3:** Use them in paragraph writing
**Day 4:** Review and reinforce

Spend 20-30 minutes daily on vocabulary improvement. In 3-4 months, you'll see significant improvement in your band score.`,
			IndonesianContent: `# Membangun Kosakata IELTS: Dari Band 6 ke Band 8

Kosakata sangat penting untuk mencapai skor band tinggi di IELTS. Bergerak dari Band 6 ke Band 8 memerlukan tidak hanya mengetahui lebih banyak kata, tetapi menggunakannya dengan tepat dan alami.

## Apa yang Berubah Antar Tingkat?

### Kosakata Band 6
- Kata-kata dasar dan umum
- Jangkauan terbatas
- Ketidakakuratan sesekali
- Kolokasi sederhana

### Kosakata Band 7
- Jangkauan kata-kata umum yang lebih luas
- Kata-kata yang kurang sering tetapi lebih canggih
- Penggunaan umumnya akurat
- Kolokasi yang sesuai dalam kebanyakan kasus

### Kosakata Band 8
- Jangkauan kosakata yang luas
- Penggunaan alami kata-kata yang kurang umum
- Makna yang tepat
- Kolokasi yang konsisten dan canggih

## Strategi Utama untuk Peningkatan Kosakata

### 1. Pelajari Keluarga Kata
Jangan hanya pelajari kata-kata individual. Pelajari bentuk terkait:
- **Mendidik** (verb) → Pendidikan (noun) → Pendidikan (adjective) → Pendidik (noun)
- **Menganalisis** (verb) → Analisis (noun) → Analitis (adjective) → Secara Analitis (adverb)

### 2. Pelajari Kolokasi
Kata-kata sering bersama dengan cara-cara tertentu:
- Pengaruh **kuat**, argumen **kuat**, bukti **kuat** (bukan pengaruh lemah)
- **Meningkatkan** kesadaran, **meningkatkan** kekhawatiran, **meningkatkan** masalah

### 3. Gunakan Sinonim dan Antonim
Perluas kosakata Anda dengan kata-kata terkait:
- **Masalah** → Isu, Tantangan, Kesulitan, Hambatan
- **Baik** → Luar biasa, Positif, Bermanfaat, Menguntungkan

### 4. Praktikkan Penggunaan Kontekstual
Pelajari kata-kata dalam kalimat, bukan secara terisolasi:
- Sebagai gantinya: "ambisius" (adjective)
- Pelajari: "tujuan ambisius," "orang yang ambisius," "dengan ambisius mengejar"

## Kesalahan Kosakata IELTS Umum

**Kesalahan 1:** Menggunakan kata-kata informal dalam penulisan formal
- ❌ "Banyak orang berpikir..."
- ✅ "Banyak individu percaya..."

**Kesalahan 2:** Menerapkan kata-kata canggih dengan tidak benar
- ❌ "Keuntungan perusahaan menghancurkan" (seharusnya "menurun" atau "jatuh")
- ✅ "Keuntungan perusahaan menunjukkan penurunan yang signifikan"

**Kesalahan 3:** Overusing kosakata yang sama
- ❌ Mengulangi "penting" berkali-kali
- ✅ Menggunakan sinonim: "krusial," "signifikan," "esensial," "penting"

## Sumber Pembangunan Kosakata

- Daftar kata akademik (570 kata mencakup 90% teks akademik)
- Daftar kosakata khusus IELTS
- Kamus kolokasi
- Materi praktik membaca

## Rutinitas Praktik Harian

**Hari 1:** Pelajari 5-10 kata baru dalam konteks
**Hari 2:** Praktikkan menggunakannya dalam kalimat
**Hari 3:** Gunakan dalam penulisan paragraf
**Hari 4:** Tinjau dan perkuat

Habiskan 20-30 menit setiap hari untuk peningkatan kosakata. Dalam 3-4 bulan, Anda akan melihat peningkatan signifikan dalam skor band Anda.`,
			Category: "Guide",
			Tags:     []string{"vocabulary", "band-improvement", "tips"},
		},
		{
			EnglishTitle:    "IELTS Task 2 Essay Structure: The Formula for Success",
			IndonesianTitle: "Struktur Esai IELTS Task 2: Formula untuk Sukses",
			EnglishContent: `# IELTS Task 2 Essay Structure: The Formula for Success

A well-structured essay is the foundation of a high band score. Let's break down the winning formula for IELTS Task 2.

## The Five-Paragraph Structure

### 1. Introduction (40-50 words)
**Purpose:** Hook the reader and present your thesis

**Components:**
- Background context (1-2 sentences)
- Your clear position or main argument
- Brief preview of main points

**Example:**
"Climate change is one of the most pressing issues of our time. While some argue that individual action is insufficient, I firmly believe that personal responsibility plays a crucial role in addressing this global challenge."

### 2. Body Paragraph 1 (80-100 words)
**Components:**
- Topic sentence stating your first main point
- 2-3 supporting sentences with explanation
- 1-2 specific examples
- Brief linking back to thesis

### 3. Body Paragraph 2 (80-100 words)
**Components:**
- Topic sentence stating your second main point
- 2-3 supporting sentences with explanation
- 1-2 specific examples
- Brief linking back to thesis

### 4. Counter-Argument Paragraph (Optional, 60-80 words)
**Components:**
- Acknowledge an alternative viewpoint
- Explain why you disagree
- Return to your main position

### 5. Conclusion (50-60 words)
**Components:**
- Restate your thesis in new words
- Summarize main points briefly
- Final thought or call to action

## Word Distribution Guide

- **Total:** 250-350 words
- **Introduction:** ~50 words (15%)
- **Body 1:** ~100 words (30%)
- **Body 2:** ~100 words (30%)
- **Conclusion:** ~50 words (15%)
- **Buffer:** ~50 words for transitions and flexibility

## Cohesion Devices to Use

**Adding ideas:** Additionally, Furthermore, Moreover, In addition
**Contrasting:** However, Nevertheless, On the other hand, In contrast
**Explaining:** As a result, Consequently, Therefore, Thus
**Exemplifying:** For example, For instance, Such as, To illustrate

## Common Structure Mistakes

**Mistake 1:** Unclear thesis statement
- ❌ No clear position stated
- ✅ "I agree with this view because..."

**Mistake 2:** Weak topic sentences
- ❌ "The economy is important"
- ✅ "Small businesses drive economic growth through job creation"

**Mistake 3:** Insufficient examples
- ❌ Just assertion
- ✅ Assertion + specific example + explanation

## Sample Essay Structure

**Question:** Some people think that social media has had a negative effect on society. To what extent do you agree?

**Introduction (45 words):**
"Social media has fundamentally transformed how we communicate and share information. While I acknowledge its benefits in connecting people globally, I firmly believe that its negative impacts on mental health and social relationships significantly outweigh these advantages."

**Body 1 (95 words):**
"First, extensive research demonstrates that social media contributes to anxiety and depression, particularly among young people. Studies have shown that excessive scrolling and comparison culture create unrealistic standards. For example, adolescents spending over three hours daily on social media report higher rates of mental health issues. Furthermore, the constant need for validation through likes and comments damages self-esteem."

**Body 2 (98 words):**
"Second, social media has eroded face-to-face interactions and authentic relationships. People increasingly prefer virtual communication over personal meetings, weakening social bonds. For instance, family dinners are now interrupted by phone notifications rather than serving as genuine connection time. Additionally, cyberbullying has created hostile online environments that make people withdraw from both social media and real-life interactions, exacerbating feelings of isolation."

**Conclusion (52 words):**
"In conclusion, while social media offers connectivity benefits, its detrimental effects on mental health and genuine relationships cannot be ignored. Society must establish healthier boundaries with these platforms. Without intervention, the psychological and social costs will continue to escalate, making regulation essential."

**Total: 290 words**

## Practice Tips

1. Write essays within 40 minutes
2. Spend 10 minutes planning your structure
3. Allocate time proportionally to each section
4. Review for coherence before checking grammar

Mastering this structure will dramatically improve your Task 2 scores!`,
			IndonesianContent: `# Struktur Esai IELTS Task 2: Formula untuk Sukses

Esai yang terstruktur dengan baik adalah fondasi dari skor band yang tinggi. Mari kita uraikan formula kemenangan untuk IELTS Task 2.

## Struktur Lima Paragraf

### 1. Pendahuluan (40-50 kata)
**Tujuan:** Menarik perhatian pembaca dan menyajikan tesis Anda

**Komponen:**
- Konteks latar belakang (1-2 kalimat)
- Posisi Anda yang jelas atau argumen utama
- Pratinjau singkat tentang poin-poin utama

**Contoh:**
"Perubahan iklim adalah salah satu isu paling mendesak zaman kita. Meskipun beberapa berpendapat bahwa tindakan individu tidak cukup, saya percaya bahwa tanggung jawab pribadi memainkan peran penting dalam mengatasi tantangan global ini."

### 2. Paragraf Tubuh 1 (80-100 kata)
**Komponen:**
- Kalimat topik yang menyatakan poin utama Anda yang pertama
- 2-3 kalimat pendukung dengan penjelasan
- 1-2 contoh spesifik
- Penghubung singkat kembali ke tesis

### 3. Paragraf Tubuh 2 (80-100 kata)
**Komponen:**
- Kalimat topik yang menyatakan poin utama Anda yang kedua
- 2-3 kalimat pendukung dengan penjelasan
- 1-2 contoh spesifik
- Penghubung singkat kembali ke tesis

### 4. Paragraf Argumen Kontra (Opsional, 60-80 kata)
**Komponen:**
- Akui sudut pandang alternatif
- Jelaskan mengapa Anda tidak setuju
- Kembali ke posisi utama Anda

### 5. Kesimpulan (50-60 kata)
**Komponen:**
- Nyatakan kembali tesis Anda dengan kata-kata baru
- Ringkas poin-poin utama secara singkat
- Pemikiran terakhir atau ajakan bertindak

## Panduan Distribusi Kata

- **Total:** 250-350 kata
- **Pendahuluan:** ~50 kata (15%)
- **Tubuh 1:** ~100 kata (30%)
- **Tubuh 2:** ~100 kata (30%)
- **Kesimpulan:** ~50 kata (15%)
- **Penyangga:** ~50 kata untuk transisi dan fleksibilitas

## Perangkat Kohesi untuk Digunakan

**Menambah ide:** Selain itu, Lebih lanjut, Terlebih lagi, Sebagai tambahan
**Kontras:** Namun, Meskipun demikian, Di sisi lain, Sebaliknya
**Menjelaskan:** Akibatnya, Akibatnya, Oleh karena itu, Dengan demikian
**Memberi contoh:** Misalnya, Sebagai contoh, Seperti, Untuk mengilustrasikan

## Kesalahan Struktur Umum

**Kesalahan 1:** Pernyataan tesis yang tidak jelas
- ❌ Tidak ada posisi yang jelas dinyatakan
- ✅ "Saya setuju dengan pandangan ini karena..."

**Kesalahan 2:** Kalimat topik yang lemah
- ❌ "Ekonomi itu penting"
- ✅ "Bisnis kecil mendorong pertumbuhan ekonomi melalui penciptaan lapangan kerja"

**Kesalahan 3:** Contoh tidak cukup
- ❌ Hanya pernyataan
- ✅ Pernyataan + contoh spesifik + penjelasan

## Struktur Esai Contoh

**Pertanyaan:** Beberapa orang berpikir bahwa media sosial telah memiliki efek negatif pada masyarakat. Sejauh mana Anda setuju?

**Pendahuluan (45 kata):**
"Media sosial telah secara fundamental mengubah cara kami berkomunikasi dan berbagi informasi. Meskipun saya mengakui manfaatnya dalam menghubungkan orang secara global, saya percaya bahwa dampak negatifnya pada kesehatan mental dan hubungan sosial jauh melampaui keuntungan ini."

**Tubuh 1 (95 kata):**
"Pertama, penelitian luas menunjukkan bahwa media sosial berkontribusi pada kecemasan dan depresi, khususnya di kalangan generasi muda. Studi telah menunjukkan bahwa scrolling yang berlebihan dan budaya perbandingan menciptakan standar yang tidak realistis. Sebagai contoh, remaja yang menghabiskan lebih dari tiga jam sehari di media sosial melaporkan tingkat masalah kesehatan mental yang lebih tinggi. Lebih lanjut, kebutuhan konstan akan validasi melalui suka dan komentar merusak kepercayaan diri."

**Tubuh 2 (98 kata):**
"Kedua, media sosial telah mengikis interaksi tatap muka dan hubungan autentik. Orang semakin memilih komunikasi virtual daripada pertemuan pribadi, melemahkan ikatan sosial. Sebagai contoh, makan malam keluarga kini terganggu oleh notifikasi telepon daripada melayani sebagai waktu koneksi yang nyata. Selain itu, cyber-bullying telah menciptakan lingkungan online yang bermusuhan yang membuat orang mundur dari media sosial dan interaksi kehidupan nyata, memperburuk perasaan isolasi."

**Kesimpulan (52 kata):**
"Kesimpulannya, meskipun media sosial menawarkan manfaat konektivitas, efek merusak pada kesehatan mental dan hubungan sejati tidak dapat diabaikan. Masyarakat harus membangun batas-batas yang lebih sehat dengan platform ini. Tanpa intervensi, biaya psikologis dan sosial akan terus meningkat, membuat regulasi penting."

**Total: 290 kata**

## Kiat Praktik

1. Tulis esai dalam 40 menit
2. Habiskan 10 menit merencanakan struktur Anda
3. Alokasikan waktu secara proporsional ke setiap bagian
4. Tinjau untuk kohesi sebelum memeriksa tata bahasa

Menguasai struktur ini akan secara dramatis meningkatkan skor Task 2 Anda!`,
			Category: "Strategy",
			Tags:     []string{"task-2", "essay-structure", "writing-tips"},
		},
		{
			EnglishTitle:    "Cohesion and Coherence in IELTS Writing: A Complete Guide",
			IndonesianTitle: "Kohesi dan Koherensi dalam Penulisan IELTS: Panduan Lengkap",
			EnglishContent: `# Cohesion and Coherence in IELTS Writing: A Complete Guide

Coherence and Cohesion (CC) is worth 25% of your writing grade. Understanding the difference and how to implement both is essential for Band 7+.

## What's the Difference?

### Coherence
**Definition:** The logical flow and organization of ideas

**Characteristics:**
- Ideas connect logically in sequence
- Paragraphs have a clear topic
- Main ideas are developed systematically
- Reader can easily follow your reasoning

**Example of good coherence:**
"Social media has changed communication. First, it allows instant global connection. Second, it enables businesses to reach customers. Third, it creates communities around shared interests."

### Cohesion
**Definition:** The use of linking words and phrases to connect ideas

**Characteristics:**
- Smooth transitions between sentences
- Appropriate use of linking devices
- Pronouns clearly reference nouns
- Repeated ideas are clearly tied together

**Example of good cohesion:**
"Social media has changed communication significantly. Furthermore, it allows instant global connection. Moreover, it enables businesses to reach customers effectively. In addition, it creates communities around shared interests."

## Cohesive Devices You Must Know

### 1. Additive (Adding Ideas)
- Additionally, Furthermore, Moreover, In addition
- Also, As well as, Besides, What's more

### 2. Adversative (Contrasting)
- However, Nevertheless, On the other hand, In contrast
- Although, Despite, Whereas, Yet

### 3. Causal (Cause and Effect)
- Because, Since, As, Due to, Caused by
- Therefore, Consequently, As a result, Thus

### 4. Sequential (Order)
- First, Firstly, Initially, To begin with
- Second, Subsequently, After that, Meanwhile
- Finally, Lastly, In conclusion, Ultimately

### 5. Exemplifying (Giving Examples)
- For example, For instance, Such as, Namely
- In particular, Specifically, To illustrate, Like

## Building Coherent Paragraphs

### Structure:
1. **Topic Sentence** - States the main idea
2. **Supporting Sentences** - Explain with details
3. **Examples/Evidence** - Provide proof
4. **Concluding Sentence** - Link back to thesis

### Example Paragraph:
"Environmental pollution is a critical issue affecting modern cities. [Topic] Air quality has deteriorated significantly due to increased vehicle emissions and industrial activities. [Explanation] For instance, cities like Delhi and Beijing frequently experience hazardous air quality levels. [Example] Moreover, water pollution from factories contaminates drinking water supplies. [Additional point] These problems demonstrate the urgent need for environmental regulations. [Concluding]"

## Common CC Mistakes

**Mistake 1:** No linking words
- ❌ Sentence 1. Sentence 2. Sentence 3.
- ✅ Sentence 1. Furthermore, sentence 2. However, sentence 3.

**Mistake 2:** Overusing the same linking word
- ❌ "Additionally...Additionally...Additionally..."
- ✅ Vary: "Furthermore," "Moreover," "In addition," "What's more"

**Mistake 3:** Vague pronouns
- ❌ "It is important because of this."
- ✅ "This technology is important because it reduces emissions."

**Mistake 4:** Inconsistent theme
- ❌ Mixing arguments from different topics in one paragraph
- ✅ Keep one main idea per paragraph

**Mistake 5:** Weak topic sentences
- ❌ "I will talk about education"
- ✅ "Technology has revolutionized modern education by enabling personalized learning"

## Advanced Techniques for Band 8

### 1. Pronoun Reference
Link ideas using pronouns that clearly reference previous nouns:
"Renewable energy has grown significantly. This technology is crucial for sustainability. Its implementation requires substantial investment."

### 2. Repetition and Paraphrase
Intentionally repeat key concepts in varied ways:
"Climate change poses serious risks. This environmental crisis threatens biodiversity. Such ecological challenges demand immediate action."

### 3. Parallel Structures
Use similar grammatical structures for related ideas:
"Education improves economic prospects, enhances critical thinking, and expands career opportunities."

### 4. Signposting Language
Guide readers through your argument:
- "My argument consists of three main points..."
- "I will now examine each point in detail..."
- "This evidence clearly demonstrates that..."

## Practice Exercise

Rewrite the following paragraph with improved cohesion and coherence:

**Original:**
"Technology is important. Computers help people work. The internet connects people. Social media can be good. It can also be bad."

**Improved:**
"Technology has become integral to modern society. Computers enable efficient work and increase productivity. Moreover, the internet connects people globally. While social media platforms facilitate communication and community building, they also pose risks such as mental health issues and privacy concerns. Therefore, technology requires careful management to maximize benefits while minimizing harms."

## Key Takeaways

1. **Coherence** comes from organized ideas and logical structure
2. **Cohesion** comes from linking words and clear reference
3. Use a mix of different linking devices
4. Keep paragraphs focused on one main idea
5. Practice paraphrasing to show vocabulary range

Practice these techniques regularly, and you'll achieve Band 7-8 in Coherence and Cohesion!`,
			IndonesianContent: `# Kohesi dan Koherensi dalam Penulisan IELTS: Panduan Lengkap

Coherence dan Cohesion (CC) bernilai 25% dari nilai penulisan Anda. Memahami perbedaan dan cara menerapkan keduanya sangat penting untuk Band 7+.

## Apa Perbedaannya?

### Koherensi
**Definisi:** Aliran logis dan organisasi ide-ide

**Karakteristik:**
- Ide terhubung secara logis dalam urutan
- Paragraf memiliki topik yang jelas
- Ide-ide utama berkembang secara sistematis
- Pembaca dapat dengan mudah mengikuti penalaran Anda

**Contoh koherensi yang baik:**
"Media sosial telah mengubah komunikasi. Pertama, memungkinkan koneksi global instan. Kedua, memungkinkan bisnis menjangkau pelanggan. Ketiga, menciptakan komunitas di sekitar minat bersama."

### Kohesi
**Definisi:** Penggunaan kata-kata dan frasa penghubung untuk menghubungkan ide-ide

**Karakteristik:**
- Transisi yang mulus antar kalimat
- Penggunaan perangkat penghubung yang sesuai
- Kata ganti jelas merujuk pada kata benda
- Ide-ide yang diulang jelas terikat bersama

**Contoh kohesi yang baik:**
"Media sosial telah mengubah komunikasi secara signifikan. Lebih lanjut, memungkinkan koneksi global instan. Selain itu, memungkinkan bisnis menjangkau pelanggan secara efektif. Sebagai tambahan, menciptakan komunitas di sekitar minat bersama."

## Perangkat Kohesi yang Harus Anda Ketahui

### 1. Aditif (Menambah Ide)
- Selain itu, Lebih lanjut, Terlebih lagi, Sebagai tambahan
- Juga, Serta, Selain, Apa lagi

### 2. Adversatif (Kontras)
- Namun, Meskipun demikian, Di sisi lain, Sebaliknya
- Meskipun, Terlepas dari, Padahal, Namun

### 3. Kausal (Sebab dan Akibat)
- Karena, Sejak, Sebagai, Karena, Disebabkan oleh
- Oleh karena itu, Akibatnya, Sebagai hasilnya, Dengan demikian

### 4. Sekuensial (Urutan)
- Pertama, Pertama-tama, Awalnya, Untuk memulai
- Kedua, Selanjutnya, Setelah itu, Sementara itu
- Akhirnya, Terakhir, Sebagai kesimpulannya, Pada akhirnya

### 5. Memberi Contoh
- Misalnya, Sebagai contoh, Seperti, Yaitu
- Khususnya, Secara spesifik, Untuk mengilustrasikan, Seperti

## Membangun Paragraf yang Koheren

### Struktur:
1. **Kalimat Topik** - Menyatakan ide utama
2. **Kalimat Pendukung** - Jelaskan dengan detail
3. **Contoh/Bukti** - Sediakan bukti
4. **Kalimat Penutup** - Hubungkan kembali ke tesis

### Contoh Paragraf:
"Polusi lingkungan adalah masalah kritis yang mempengaruhi kota-kota modern. [Topik] Kualitas udara telah menurun secara signifikan karena peningkatan emisi kendaraan dan aktivitas industri. [Penjelasan] Sebagai contoh, kota-kota seperti Delhi dan Beijing sering mengalami tingkat kualitas udara yang berbahaya. [Contoh] Lebih lanjut, polusi air dari pabrik mengkontaminasi pasokan air minum. [Poin tambahan] Masalah-masalah ini menunjukkan kebutuhan mendesak untuk regulasi lingkungan. [Penutup]"

## Kesalahan CC Umum

**Kesalahan 1:** Tidak ada kata-kata penghubung
- ❌ Kalimat 1. Kalimat 2. Kalimat 3.
- ✅ Kalimat 1. Lebih lanjut, kalimat 2. Namun, kalimat 3.

**Kesalahan 2:** Overusing kata penghubung yang sama
- ❌ "Selain itu...Selain itu...Selain itu..."
- ✅ Bervariasi: "Lebih lanjut," "Terlebih lagi," "Sebagai tambahan," "Apa lagi"

**Kesalahan 3:** Kata ganti yang kabur
- ❌ "Ini penting karena hal ini."
- ✅ "Teknologi ini penting karena mengurangi emisi."

**Kesalahan 4:** Tema yang tidak konsisten
- ❌ Mencampur argumen dari topik berbeda dalam satu paragraf
- ✅ Pertahankan satu ide utama per paragraf

**Kesalahan 5:** Kalimat topik yang lemah
- ❌ "Saya akan berbicara tentang pendidikan"
- ✅ "Teknologi telah merevolusi pendidikan modern dengan memungkinkan pembelajaran personal"

## Teknik Lanjutan untuk Band 8

### 1. Referensi Kata Ganti
Hubungkan ide-ide menggunakan kata ganti yang jelas merujuk pada kata benda sebelumnya:
"Energi terbarukan telah berkembang secara signifikan. Teknologi ini sangat penting untuk keberlanjutan. Penerapannya memerlukan investasi substansial."

### 2. Pengulangan dan Parafrase
Ulangi konsep-konsep kunci dengan cara yang bervariasi:
"Perubahan iklim menimbulkan risiko serius. Krisis lingkungan ini mengancam keanekaragaman hayati. Tantangan ekologis seperti itu menuntut tindakan segera."

### 3. Struktur Paralel
Gunakan struktur tata bahasa yang sama untuk ide-ide terkait:
"Pendidikan meningkatkan prospek ekonomi, meningkatkan pemikiran kritis, dan memperluas peluang karir."

### 4. Bahasa Signposting
Pandukan pembaca melalui argumen Anda:
- "Argumen saya terdiri dari tiga poin utama..."
- "Saya sekarang akan memeriksa setiap poin secara detail..."
- "Bukti ini jelas menunjukkan bahwa..."

## Latihan Praktik

Tulis ulang paragraf berikut dengan kohesi dan koherensi yang ditingkatkan:

**Asli:**
"Teknologi itu penting. Komputer membantu orang bekerja. Internet menghubungkan orang. Media sosial bisa bagus. Itu juga bisa buruk."

**Ditingkatkan:**
"Teknologi telah menjadi integral bagi masyarakat modern. Komputer memungkinkan pekerjaan yang efisien dan meningkatkan produktivitas. Lebih lanjut, internet menghubungkan orang secara global. Meskipun platform media sosial memfasilitasi komunikasi dan pembangunan komunitas, mereka juga menimbulkan risiko seperti masalah kesehatan mental dan kekhawatiran privasi. Oleh karena itu, teknologi memerlukan manajemen yang hati-hati untuk memaksimalkan manfaat sambil meminimalkan bahaya."

## Poin-Poin Kunci

1. **Koherensi** berasal dari ide-ide terorganisir dan struktur logis
2. **Kohesi** berasal dari kata-kata penghubung dan referensi yang jelas
3. Gunakan campuran perangkat penghubung yang berbeda
4. Pertahankan fokus paragraf pada satu ide utama
5. Praktikkan parafrase untuk menunjukkan jangkauan kosakata

Praktikkan teknik-teknik ini secara teratur, dan Anda akan mencapai Band 7-8 dalam Coherence dan Cohesion!`,
			Category: "Guide",
			Tags:     []string{"coherence", "cohesion", "writing-tips", "band-improvement"},
		},
	}
}

// Helper functions
func estimateReadTime(content string) string {
	// Rough estimate: 200 words per minute
	wordCount := len(strings.Fields(content))
	minutes := (wordCount / 200) + 1
	if minutes < 1 {
		return "1 min read"
	}
	if minutes > 15 {
		return "15+ min read"
	}
	return fmt.Sprintf("%d min read", minutes)
}

func extractExcerpt(content string) string {
	// Extract first 150 characters as excerpt
	if len(content) > 150 {
		return content[:150] + "..."
	}
	return content
}

func ptrTime(t time.Time) *time.Time {
	return &t
}
