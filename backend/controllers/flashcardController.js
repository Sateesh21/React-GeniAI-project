import Flashcard from "../models/Flashcard.js";

export const getFlashcards = async (req, res, next) => {
    try {
        const flashcards = await Flashcard.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
            .populate('DocumentId', 'title fileName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });

    } catch (error) {
        next(error);
    }
};

export const getAllFlashcardSets = async (req, res, next) => {
    try {
        const flashcardSets = await Flashcard.find({ userId: req.user._id })
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets,
        });
    } catch (error) {
        next(error);
    }
};

export const reviewFlashcard = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set or card not found',
                statusCode: 404
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

        if (cardIndex === -1) {
            return res.status(404).join({
                success: false,
                error: 'Card not found in set',
                statusCode: 404
            });
        }

        //Upload review info
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcard reviewed Successfully'
        });

    } catch (error) {
        next(error);
    }
};

export const toggleStarFlashcard = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: flase,
                error: 'Flashcard set or card not found',
                statusCode: 404
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Card not found in Set',
                statusCode: 404
            });
        }

        //Toggle star
        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'unstarred'}`
        });


    } catch (error) {
        next(error);
    }
};

export const deleteFlashcardSet = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: flase,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};