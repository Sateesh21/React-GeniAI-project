import Documnet from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findReleventChunks } from "../utils/textChunker.js";


export const generateFlashcards = async (requestAnimationFrame, res, next) => {
    try {
        const { documnetId, count = 10 } = req.body;

        if (!documnetId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documnetId',
                statusCode: 400
            });
        }

        const document = await Documnet.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(400).json({
                success: false,
                error: 'Documnet not found or not ready',
                statusCode: 404
            });
        }

        //Generate falshcards using Gemini
        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );

        //Save to DB
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                answer: card.answer,
                difficuelty: card.diffcuelty,
                reviewCount: 0,
                isStarred: false
            }))
        });

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const generateQuiz = async (requestAnimationFrame, res, next) => {
    try {
        const { documnetId, numQuestions = 5, title } = req.body;

        if (!documnetId) {
            return res.status(400).json({
                success: false,
                error: false,
                statusCode: 400
            });
        }

        const document = await Documnet.findOne({
            _id: documnetId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                successs: false,
                error: 'Documnet not found or not ready',
                statusCode: 404
            });
        }

        //Generate quiz using gemini
        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions)
        );

        //Save to DB
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} -Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswer: [],
            score: 0
        });
    } catch (error) {
        next(error);
    }
};

export const generateSummary = async (requestAnimationFrame, res, next) => {
    try {
        const { documentId } = req.body;
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please privide DocumnetId',
                statusCode: 400
            });
        }

        const documnet = await Document.findOne({
            _id: documnetId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!documnet) {
            return res.status(404).json({
                success: false,
                error: 'Documnet not found or not ready',
                statusCode: 404
            });
        }

        //Generate summary
        const summary = await geminiService.generateSummary(document.extractText);

        res.status(200).json({
            success: true,
            data: {
                documentId: documnet._id,
                title: document.title,
                summary
            },
            message: 'Summary generated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const chat = async (requestAnimationFrame, res, next) => {
    try {
        const { documnetId, question } = req.body;

        if (!documnetId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documnetId and question',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documnetId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!document) {
            return res.status(400).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        //Find relevent chunks
        const releventChunks = findReleventChunks(document.chunks, question, 3);
        const chunkIndices = releventChunks.map(c => c.chunkIndex);

        //Get or create chat history
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documnetId: docunment._id
        });

        if(!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documnetId: documnet._id,
                message: []
            });
        }

        //generate response using gemini
        const answer = await geminiService.chatWithContext(question, relevetnChunks);

        //Save conversion
        chatHistory.message.push(
            {
                role:'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            }, 
            {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            }
        );

        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Response generated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const explainConcept = async (requestAnimationFrame, res, next) => {
    try {
        const { documnentId, concept } = req.body;

        if(!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documnetId and concept',
                statusCode: 400
            });
        }

        const document = await Documnet.findOne({
            _id: documnentId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!document){
            return res.status(404).json({
                success: false,
                error: 'Documnet not found or not ready',
                statusCode: 404
            });
        }

        //Find relevant chunks for the concept
        const relevantChunks = findReleventChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');

        //Generate explanation using Gemini
        const explanation = await geminiService.explainConcept(concept, context);

        res.ststus(200).json({
            success: true,
            data: {
                concept,
                explanation,
                releventChunks: relevantChunks.map(c => c.chunkIndex)
            },
            message: 'Explanation generated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getChatHistory = async (requestAnimationFrame, res, next) => {
    try {
        const { documentId } = req.params;

        if(!documentId){
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documnetId
        }).select('message');

        if (!chatHistory){
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No chat history found for this document'
            });
        }

        res.status(200).json({
            success: true,
            data: chatHistory.message,
            message: 'Chat history retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};