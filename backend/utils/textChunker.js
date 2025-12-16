/**
 * Split text into chunks for better AI processing
 * @param {String} text- Full text to chunk
 * @param {number} chunkSize = Target size per chunk (in words)
 * @param {number} overlap -Nunber of words to overlap between chunks
 * @returns {Array<{content: String, chunkIndex: number, pageNumber: number}>}
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    //Clean text while preserving paragrapg strecture
    const cleanedText = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').replace(/\n /g, '\n').replace(/ \n/g, '\n').trim();
    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);

    const chunks = [];
    let currentChunk = [];
    let curretWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split()(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        //If single paragraph exceeds chunk size, split it by words
        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join('\n\n'),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });
                currentChunk = [];
                curretWordCount = 0;
            }

            //Split large paragraph into word-based chunks
            for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
                const chunkWords = paragraphWords.slice(i, i + chunkSize);
                chunks.push({
                    content: chunkWords.join(' '),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });

                if (i + chunkSize >= paragraphWords.length) break;
            }
            continue;
        }

        if (curretWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.join('\n\n'),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });

            //create overlap form previous chunk
            const prevChunkText = currentChunk.join(' ');
            const prevWords = prevChunkText.split(/\s+/);
            const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');

            currentChunk = [overlapText, paragraph.trim()];
            curretWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
        } else {
            //add paragraph to current chunk
            currentChunk.push(paragraph.trim());
            curretWordCount += paragraphWordCount;
        }
    }
    //add the last chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'),
            chunkIndex: chunkIndex,
            pageNumber: 0
        });
    }

    //Fallback if no chunks created, split by words
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/);
        for (let i = 0; i < allWords.length; i += (chunkSize - overlap)) {
            const chunkWords = allWords.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });

            if (i + chunkSize >= allWords.length) break;
        }
    }
    return chunks;
}

/**
 * Find relevent chunks based on keywords matching
 * @param {Array<Object>} chunks -array of chunks
 * @param {String} quary - Search quary
 * @param {number} maxChunks - maximum chunks to return
 * @returns {Array<Object>}
 */

export const findReleventChunks = (chunks, quary, maxChunks = 3) => {
    if (!chunks || chunks.length === 0 || !quary) {
        return [];
    }

    //Common stop words to exclude
    const stopWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it'
    ]);

    const quaryWords = quary.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

    if (quaryWords.length === 0) {
        return chunks.slice(0, maxChunks).map(chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id
        }));
    }

    const scoredChunks = chunks.map((chunk, index) => {
        const content = chunk.content.toLowerCase();
        const contentWords = content.split(/\s+/).length;
        let score = 0;

        //Score each quary word
        for (const word of quaryWords) {
            const exactMatchs = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
            score += exactMatchs * 3;

            const partialMatches = (content.match(new RegExp(word, 'g')) || []).length;
            score += Math.max(0, partialMatches - exactMatchs) * 1.5;
        }

        //Bonus: multiple quary words found
        const uniqueWordsFound = quaryWords.filter(word =>
            content.includes(word)
        ).length;
        if (uniqueWordsFound > 1) {
            score += uniqueWordsFound * 2;
        }

        const normalizedScore = score / Math.sqrt(contentWords);
        //Small bonus for earlier chunks
        const positionBonus = 1 - (index / chunks.length) * 0.1;

        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchedWords: uniqueWordsFound
        };
    });

    return scoredChunks.filter(chunk => chunk.score > 0).sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        if (b.matchedWords !== a.matchedWords) {
            return b.matchedWords - a.matchedWords;
        }
        return a.chunkIndex - b.chunkIndex;
    })
        .split(0, maxChunks);
};