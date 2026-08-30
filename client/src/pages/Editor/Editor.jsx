import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { presentationService } from '../../services/presentationService.js';
import { EditorProvider } from '../../context/EditorContext.jsx';
import EditorInner from './EditorInner.jsx';
import { PageLoader } from '../../components/shared/LoadingSpinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    presentationService.get(id)
      .then((res) => setPresentation(res.data.presentation))
      .catch((err) => {
        showError('Presentation not found');
        navigate('/presentations');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!presentation) return null;

  return (
    <EditorProvider>
      <EditorInner initialPresentation={presentation} />
    </EditorProvider>
  );
}
