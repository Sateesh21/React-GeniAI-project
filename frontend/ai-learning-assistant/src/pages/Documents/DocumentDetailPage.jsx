import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const DocumentDetailPage = () => {

  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error('Failed to fetch document datails.');
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  //Helper function to get the full PDF URL
  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;

    const filePath = document.data.filePath;

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />
    }

    if (!document || !document.data || !document.data.filePath) {
      return <div className='text-center p-8'>PDF not available.</div>;
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className='bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm'>
        <div className='flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300'>
          <span className='text-sm font-medium text-gray-700'>Document Viewer</span>
          <a
            href={pdfUrl}
            target='_blank'
            rel="noopener noreferrer"
            className='inline-flex items-center gap-1.5 text-sm test-blue-600 hover:text-blue-700 font-medium transition-colors'>
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>
        <div className='bg-gray-100 p-1'>
          <iframe
            src={pdfUrl}
            className='w-full h-[70vh] bg-white rounded border border-gray-300'
            title='PDF Viewer'
            // frameBorder="0"
            style={{
              colorScheme: 'light',
            }} />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return "renderChat"
  };

  const renderAIActions = () => {
    return "renderAIActions"
  };

  const renderFlashcardsTab = () => {
    return "renderFlashcardsTab"
  };

  const renderQuizzesTab = () => {
    return "renderQuizzesTab"
  };

  const tabs = [
    { name: 'Content', lagel: 'Content', content: renderContent() },
    { name: 'Chat', lagel: 'Chat', content: renderChat() },
    { name: 'AI Actions', lagel: 'AI Actions', content: renderAIActions() },
    { name: 'Flashcards', lagel: 'Flashcards', content: renderFlashcardsTab() },
    { name: 'Quizzes', lagel: 'Quizzes', content: renderQuizzesTab() },
  ];

  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return <div className='text-center p-8'>Document not found.</div>;
  }
  return (
    <div>
      <div>DocumentDetailPage</div>
    </div>
  )
}

export default DocumentDetailPage;
