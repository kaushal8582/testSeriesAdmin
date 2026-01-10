'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  Tabs,
  Tab,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { questionApi } from '@/api/question.api';
import { testApi } from '@/api/test.api';
import { examApi } from '@/api/exam.api';
import { Question, CreateQuestionData, Test, Exam } from '@/types';
import { useRouter } from 'next/navigation';

export default function QuestionsPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateQuestionData>({
    questionText: '',
    questionTextHindi: '',
    options: { A: '', B: '', C: '', D: '' },
    optionsHindi: { A: '', B: '', C: '', D: '' },
    correctOption: 'A',
    explanation: '',
    explanationHindi: '',
    solution: { english: '', hindi: '' },
    marks: 1,
    negativeMarks: 0,
    testId: '',
    order: 1,
    section: 'General',
    reuseEnglishImages: false,
    reuseEnglishResultImages: false,
  });
  const [imageFiles, setImageFiles] = useState<{
    questionImage?: File;
    optionImageA?: File;
    optionImageB?: File;
    optionImageC?: File;
    optionImageD?: File;
    optionImageHindiA?: File;
    optionImageHindiB?: File;
    optionImageHindiC?: File;
    optionImageHindiD?: File;
    explanationImageEnglish?: File;
    explanationImageHindi?: File;
    solutionImageEnglish?: File;
    solutionImageHindi?: File;
  }>({});
  const [imagePreviews, setImagePreviews] = useState<{
    questionImage?: string;
    optionImageA?: string;
    optionImageB?: string;
    optionImageC?: string;
    optionImageD?: string;
    optionImageHindiA?: string;
    optionImageHindiB?: string;
    optionImageHindiC?: string;
    optionImageHindiD?: string;
    explanationImageEnglish?: string;
    explanationImageHindi?: string;
    solutionImageEnglish?: string;
    solutionImageHindi?: string;
  }>({});

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadTests();
    }
  }, [selectedExamId]);

  useEffect(() => {
    if (selectedTestId) {
      loadQuestions();
    } else {
      setQuestions([]);
    }
  }, [selectedTestId]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExams({ limit: 100 });
      // Backend returns { exams: Exam[], pagination: {...} }
      const examsData = response?.exams || [];
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (error: any) {
      console.error('Failed to load exams:', error);
      setError(error.message || 'Failed to load exams');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    if (!selectedExamId) {
      setTests([]);
      return;
    }
    try {
      // Use testApi.getTests instead of examApi.getExamTests for consistency
      const response = await testApi.getTests(selectedExamId, { limit: 100 });
      // Backend returns { tests: Test[], pagination: {...} }
      const testsData = response?.tests || [];
      const testsArray = Array.isArray(testsData) ? testsData : [];
      setTests(testsArray);
      if (testsArray.length > 0 && !selectedTestId) {
        setSelectedTestId(testsArray[0]?._id || '');
      }
    } catch (error: any) {
      console.error('Failed to load tests:', error);
      setError(error.message || 'Failed to load tests');
      setTests([]);
    }
  };

  const loadQuestions = async () => {
    if (!selectedTestId) {
      setQuestions([]);
      return;
    }
    setLoadingQuestions(true);
    try {
      console.log('Loading questions for testId:', selectedTestId);
      const response = await questionApi.getQuestions(selectedTestId, { limit: 100, includeAnswers: true });
      console.log('Questions API response:', response);
      // Backend returns { questions: Question[], pagination: {...} }
      const questionsData = response?.questions || [];
      console.log('Questions data:', questionsData);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error: any) {
      console.error('Failed to load questions:', error);
      setError(error.message || 'Failed to load questions');
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleImageChange = (field: string, file: File | null) => {
    if (file) {
      setImageFiles({ ...imageFiles, [field]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews({ ...imagePreviews, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      const newFiles = { ...imageFiles };
      delete newFiles[field as keyof typeof imageFiles];
      setImageFiles(newFiles);
      const newPreviews = { ...imagePreviews };
      delete newPreviews[field as keyof typeof imagePreviews];
      setImagePreviews(newPreviews);
    }
  };

  const handleOpenDialog = async (question?: Question) => {
    if (!selectedTestId && !question) {
      setError('Please select a test first');
      return;
    }
    if (question) {
      // Fetch the full question data by ID to ensure all fields (including Hindi) are present
      let questionToUse = question;
      try {
        setLoading(true);
        const fullQuestion = await questionApi.getQuestionById(question._id);
        console.log('Fetched full question:', fullQuestion);
        questionToUse = fullQuestion;
        setEditingQuestion(fullQuestion);
      } catch (error: any) {
        console.error('Error fetching question details:', error);
        setError('Failed to load question details. Using cached data.');
        // Fallback to the question from list
        setEditingQuestion(question);
      } finally {
        setLoading(false);
      }
      
      // Safely extract optionsHindi - handle both object format and potential null/undefined
      let optionsHindiValue = { A: '', B: '', C: '', D: '' };
      if (questionToUse.optionsHindi && typeof questionToUse.optionsHindi === 'object') {
        optionsHindiValue = {
          A: questionToUse.optionsHindi.A || '',
          B: questionToUse.optionsHindi.B || '',
          C: questionToUse.optionsHindi.C || '',
          D: questionToUse.optionsHindi.D || '',
        };
      }
      console.log('Question Hindi options:', questionToUse.optionsHindi);
      console.log('Question Hindi text:', questionToUse.questionTextHindi);
      console.log('Extracted optionsHindiValue:', optionsHindiValue);
      
      // Safely extract solution
      let solutionValue = { english: '', hindi: '' };
      if (questionToUse.solution) {
        if (typeof questionToUse.solution === 'object' && 'english' in questionToUse.solution) {
          solutionValue = {
            english: questionToUse.solution.english || '',
            hindi: questionToUse.solution.hindi || '',
          };
        } else if (typeof questionToUse.solution === 'string') {
          // If solution is a string (from old format), put it in english
          solutionValue = { english: questionToUse.solution, hindi: '' };
        }
      }
      
      setFormData({
        questionText: questionToUse.questionText || '',
        questionTextHindi: questionToUse.questionTextHindi || '',
        questionImage: questionToUse.questionImage || '',
        options: questionToUse.options || { A: '', B: '', C: '', D: '' },
        optionsHindi: optionsHindiValue,
        optionImages: questionToUse.optionImages || {},
        optionImagesHindi: questionToUse.optionImagesHindi || {},
        correctOption: questionToUse.correctOption || 'A',
        explanation: questionToUse.explanation || '',
        explanationHindi: questionToUse.explanationHindi || '',
        solution: solutionValue,
        marks: questionToUse.marks || 1,
        negativeMarks: questionToUse.negativeMarks || 0,
        testId: typeof questionToUse.testId === 'object' ? questionToUse.testId._id : questionToUse.testId,
        order: questionToUse.order || 1,
        section: (questionToUse as any).section || 'General',
        reuseEnglishImages: false,
        reuseEnglishResultImages: false,
      });
      // Set image previews from existing URLs
      setImagePreviews({
        questionImage: questionToUse.questionImage,
        optionImageA: questionToUse.optionImages?.A,
        optionImageB: questionToUse.optionImages?.B,
        optionImageC: questionToUse.optionImages?.C,
        optionImageD: questionToUse.optionImages?.D,
        optionImageHindiA: questionToUse.optionImagesHindi?.A,
        optionImageHindiB: questionToUse.optionImagesHindi?.B,
        optionImageHindiC: questionToUse.optionImagesHindi?.C,
        optionImageHindiD: questionToUse.optionImagesHindi?.D,
        explanationImageEnglish: (questionToUse as any).explanationImageEnglish,
        explanationImageHindi: (questionToUse as any).explanationImageHindi,
        solutionImageEnglish: (questionToUse as any).solutionImageEnglish,
        solutionImageHindi: (questionToUse as any).solutionImageHindi,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        questionText: '',
        questionTextHindi: '',
        options: { A: '', B: '', C: '', D: '' },
        optionsHindi: { A: '', B: '', C: '', D: '' },
        correctOption: 'A',
        explanation: '',
        explanationHindi: '',
        solution: { english: '', hindi: '' },
        marks: 1,
        negativeMarks: 0,
        testId: selectedTestId,
        order: (questions && Array.isArray(questions) ? questions.length : 0) + 1,
        section: 'General',
        reuseEnglishImages: false,
        reuseEnglishResultImages: false,
      });
      setImagePreviews({});
    }
    setImageFiles({});
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
    setError('');
    setImageFiles({});
    setImagePreviews({});
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSubmitting(true);
      // Validate required fields
      if (!formData.questionText.trim()) {
        setError('Question text is required');
        setSubmitting(false);
        return;
      }
      if (!formData.testId) {
        setError('Please select a test');
        setSubmitting(false);
        return;
      }
      // Check if options have text OR images
      const hasOptionText = formData.options.A.trim() || formData.options.B.trim() || 
          formData.options.C.trim() || formData.options.D.trim();
      const hasOptionImages = imageFiles.optionImageA || imageFiles.optionImageB || 
          imageFiles.optionImageC || imageFiles.optionImageD || 
          imagePreviews.optionImageA || imagePreviews.optionImageB || 
          imagePreviews.optionImageC || imagePreviews.optionImageD;
      
      if (!hasOptionText && !hasOptionImages) {
        setError('At least one option must have text or image');
        setSubmitting(false);
        return;
      }
      
      // Validate each option has either text or image
      const optionKeys: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
      for (const key of optionKeys) {
        const hasText = formData.options[key]?.trim();
        const hasImage = imageFiles[`optionImage${key}` as keyof typeof imageFiles] || 
                        imagePreviews[`optionImage${key}` as keyof typeof imagePreviews];
        if (!hasText && !hasImage) {
          setError(`Option ${key} must have either text or image`);
          setSubmitting(false);
          return;
        }
      }
      if (!formData.correctOption || !['A', 'B', 'C', 'D'].includes(formData.correctOption)) {
        setError('Please select a correct option');
        return;
      }
      if (formData.marks < 0) {
        setError('Marks must be 0 or greater');
        return;
      }
      if (formData.negativeMarks < 0) {
        setError('Negative marks must be 0 or greater');
        return;
      }
      
      // Check if we have any image files to upload
      const hasImageFiles = Object.keys(imageFiles).length > 0;
      
      if (hasImageFiles) {
        // Use FormData for file uploads
        const formDataToSend = new FormData();
        
        // Add all text fields
        formDataToSend.append('questionText', formData.questionText);
        if (formData.questionTextHindi) formDataToSend.append('questionTextHindi', formData.questionTextHindi);
        formDataToSend.append('options[A]', formData.options.A);
        formDataToSend.append('options[B]', formData.options.B);
        formDataToSend.append('options[C]', formData.options.C);
        formDataToSend.append('options[D]', formData.options.D);
        if (formData.optionsHindi) {
          formDataToSend.append('optionsHindi[A]', formData.optionsHindi.A || '');
          formDataToSend.append('optionsHindi[B]', formData.optionsHindi.B || '');
          formDataToSend.append('optionsHindi[C]', formData.optionsHindi.C || '');
          formDataToSend.append('optionsHindi[D]', formData.optionsHindi.D || '');
        }
        formDataToSend.append('correctOption', formData.correctOption);
        if (formData.explanation) formDataToSend.append('explanation', formData.explanation);
        if (formData.explanationHindi) formDataToSend.append('explanationHindi', formData.explanationHindi);
        if (formData.solution?.english) formDataToSend.append('solution[english]', formData.solution.english);
        if (formData.solution?.hindi) formDataToSend.append('solution[hindi]', formData.solution.hindi);
        formDataToSend.append('marks', formData.marks.toString());
        formDataToSend.append('negativeMarks', formData.negativeMarks.toString());
        formDataToSend.append('testId', formData.testId);
        formDataToSend.append('order', formData.order.toString());
        if (formData.section) formDataToSend.append('section', formData.section);
        formDataToSend.append('reuseEnglishImages', (formData.reuseEnglishImages || false).toString());
        formDataToSend.append('reuseEnglishResultImages', (formData.reuseEnglishResultImages || false).toString());
        
        // Add image files
        if (imageFiles.questionImage) formDataToSend.append('questionImage', imageFiles.questionImage);
        if (imageFiles.optionImageA) formDataToSend.append('optionImageA', imageFiles.optionImageA);
        if (imageFiles.optionImageB) formDataToSend.append('optionImageB', imageFiles.optionImageB);
        if (imageFiles.optionImageC) formDataToSend.append('optionImageC', imageFiles.optionImageC);
        if (imageFiles.optionImageD) formDataToSend.append('optionImageD', imageFiles.optionImageD);
        if (!formData.reuseEnglishImages) {
          if (imageFiles.optionImageHindiA) formDataToSend.append('optionImageHindiA', imageFiles.optionImageHindiA);
          if (imageFiles.optionImageHindiB) formDataToSend.append('optionImageHindiB', imageFiles.optionImageHindiB);
          if (imageFiles.optionImageHindiC) formDataToSend.append('optionImageHindiC', imageFiles.optionImageHindiC);
          if (imageFiles.optionImageHindiD) formDataToSend.append('optionImageHindiD', imageFiles.optionImageHindiD);
        }
        // Add explanation and solution images
        if (imageFiles.explanationImageEnglish) formDataToSend.append('explanationImageEnglish', imageFiles.explanationImageEnglish);
        if (imageFiles.solutionImageEnglish) formDataToSend.append('solutionImageEnglish', imageFiles.solutionImageEnglish);
        
        // If reuseEnglishResultImages is checked, use English images for Hindi too
        if (formData.reuseEnglishResultImages) {
          // Use English images for Hindi when checkbox is checked
          if (imageFiles.explanationImageEnglish) formDataToSend.append('explanationImageHindi', imageFiles.explanationImageEnglish);
          if (imageFiles.solutionImageEnglish) formDataToSend.append('solutionImageHindi', imageFiles.solutionImageEnglish);
        } else {
          // Use separate Hindi images when checkbox is unchecked
          if (imageFiles.explanationImageHindi) formDataToSend.append('explanationImageHindi', imageFiles.explanationImageHindi);
          if (imageFiles.solutionImageHindi) formDataToSend.append('solutionImageHindi', imageFiles.solutionImageHindi);
        }
        
        if (editingQuestion) {
          await questionApi.updateQuestion(editingQuestion._id, formDataToSend);
        } else {
          const created = await questionApi.createQuestion(formDataToSend);
          console.log('Question created successfully:', created);
        }
      } else {
        // No image files, send as JSON
        if (editingQuestion) {
          await questionApi.updateQuestion(editingQuestion._id, formData);
        } else {
          const created = await questionApi.createQuestion(formData);
          console.log('Question created successfully:', created);
        }
      }
      
      handleCloseDialog();
      // Wait a bit before reloading to ensure backend has processed
      setTimeout(() => {
        loadQuestions();
        loadTests();
      }, 500);
    } catch (error: any) {
      console.error('Error saving question:', error);
      setError(error.message || 'Failed to save question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSubmitting(true);
      await questionApi.deleteQuestion(id);
      setDeleteConfirm(null);
      loadQuestions();
    } catch (error: any) {
      setError(error.message || 'Failed to delete question');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && exams.length === 0) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Questions Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage questions for tests
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            select
            label="Select Exam"
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setSelectedTestId('');
            }}
            sx={{ minWidth: 200 }}
            size="small"
          >
            {exams && Array.isArray(exams) ? exams.map((exam) => (
              exam ? (
                <MenuItem key={exam._id} value={exam._id}>
                  {exam.title || 'Untitled'}
                </MenuItem>
              ) : null
            )) : null}
          </TextField>
          <TextField
            select
            label="Select Test"
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            sx={{ minWidth: 200 }}
            disabled={!selectedExamId}
            size="small"
          >
            {tests && Array.isArray(tests) ? tests.map((test) => (
              test ? (
                <MenuItem key={test._id} value={test._id}>
                  {test.testName || 'Untitled'}
                </MenuItem>
              ) : null
            )) : null}
          </TextField>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={!selectedTestId}
            sx={{ 
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
            }}
          >
            Add Question
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => router.push('/questions/bulk-upload')}
            disabled={!selectedTestId}
            sx={{ 
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Bulk Upload
          </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!selectedExamId && exams.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select an exam and test from the dropdowns above to view and create questions.
        </Alert>
      )}

      {selectedExamId && !selectedTestId && tests.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a test from the dropdown above to view and create questions.
        </Alert>
      )}

      {selectedExamId && !selectedTestId && tests.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No tests found for this exam. Please create a test first before creating questions.
        </Alert>
      )}

      {!selectedExamId && exams.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No exams found. Please create an exam first before creating questions.
        </Alert>
      )}

      {selectedTestId ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Questions ({questions?.length || 0})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
              }}
            >
              Add Question
            </Button>
          </Box>
          {loadingQuestions ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 2,
              boxShadow: 2,
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Order</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Section</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Question</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Options</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Correct</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Marks</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questions && Array.isArray(questions) && questions.length > 0 ? (
                questions.map((question) => (
                  question ? (
                    <TableRow 
                      key={question._id || Math.random().toString()}
                      sx={{ 
                        '&:hover': { backgroundColor: 'action.hover' },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{question.order || 0}</TableCell>
                      <TableCell>
                        <Chip 
                          label={(question as any).section || 'General'} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {question.questionText || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {question.options ? (
                          <>
                            <Typography variant="caption" display="block">
                              A: {question.options.A ? question.options.A.substring(0, 30) : 'N/A'}...
                            </Typography>
                            <Typography variant="caption" display="block">
                              B: {question.options.B ? question.options.B.substring(0, 30) : 'N/A'}...
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption">No options</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={question.correctOption || 'N/A'} 
                          color="success" 
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          <strong>+{question.marks || 0}</strong> / -{question.negativeMarks || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => question && handleOpenDialog(question)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => question?._id && setDeleteConfirm(question._id)} 
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ) : null
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        No questions found. Create your first question for this test.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{ 
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Add First Question
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
          )}
        </Box>
      ) : (
        <Alert severity="info">Please select an exam and test to view questions</Alert>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {editingQuestion ? 'Edit Question' : 'Create New Question'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
              English Content
            </Typography>
            <TextField
              label="Question Text (English)"
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              fullWidth
              required
              multiline
              rows={3}
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Question Image (Optional)
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="question-image-upload"
                type="file"
                onChange={(e) => handleImageChange('questionImage', e.target.files?.[0] || null)}
              />
              <label htmlFor="question-image-upload">
                <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                  <UploadIcon sx={{ mr: 1 }} />
                  Upload Question Image
                </Button>
              </label>
              {imagePreviews.questionImage && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={imagePreviews.questionImage}
                    alt="Question preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleImageChange('questionImage', null)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
            <Box>
            <TextField
              label="Option A"
              value={formData.options.A}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  options: { ...formData.options, A: e.target.value },
                })
              }
              fullWidth
              required={!imageFiles.optionImageA && !imagePreviews.optionImageA}
              sx={{ mb: 1 }}
              helperText={imageFiles.optionImageA || imagePreviews.optionImageA ? "Text is optional when image is uploaded" : ""}
            />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="option-image-a-upload"
                type="file"
                onChange={(e) => handleImageChange('optionImageA', e.target.files?.[0] || null)}
              />
              <label htmlFor="option-image-a-upload">
                <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                  <UploadIcon sx={{ mr: 1 }} />
                  Upload Image for Option A
                </Button>
              </label>
              {imagePreviews.optionImageA && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <img
                    src={imagePreviews.optionImageA}
                    alt="Option A preview"
                    style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleImageChange('optionImageA', null)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
            <Box>
            <TextField
              label="Option B"
              value={formData.options.B}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  options: { ...formData.options, B: e.target.value },
                })
              }
              fullWidth
              required={!imageFiles.optionImageB && !imagePreviews.optionImageB}
              sx={{ mb: 1 }}
              helperText={imageFiles.optionImageB || imagePreviews.optionImageB ? "Text is optional when image is uploaded" : ""}
            />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="option-image-b-upload"
                type="file"
                onChange={(e) => handleImageChange('optionImageB', e.target.files?.[0] || null)}
              />
              <label htmlFor="option-image-b-upload">
                <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                  <UploadIcon sx={{ mr: 1 }} />
                  Upload Image for Option B
                </Button>
              </label>
              {imagePreviews.optionImageB && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <img
                    src={imagePreviews.optionImageB}
                    alt="Option B preview"
                    style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleImageChange('optionImageB', null)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
            <Box>
            <TextField
              label="Option C"
              value={formData.options.C}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  options: { ...formData.options, C: e.target.value },
                })
              }
              fullWidth
              required={!imageFiles.optionImageC && !imagePreviews.optionImageC}
              sx={{ mb: 1 }}
              helperText={imageFiles.optionImageC || imagePreviews.optionImageC ? "Text is optional when image is uploaded" : ""}
            />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="option-image-c-upload"
                type="file"
                onChange={(e) => handleImageChange('optionImageC', e.target.files?.[0] || null)}
              />
              <label htmlFor="option-image-c-upload">
                <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                  <UploadIcon sx={{ mr: 1 }} />
                  Upload Image for Option C
                </Button>
              </label>
              {imagePreviews.optionImageC && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <img
                    src={imagePreviews.optionImageC}
                    alt="Option C preview"
                    style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleImageChange('optionImageC', null)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
            <Box>
            <TextField
              label="Option D"
              value={formData.options.D}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  options: { ...formData.options, D: e.target.value },
                })
              }
              fullWidth
              required={!imageFiles.optionImageD && !imagePreviews.optionImageD}
              sx={{ mb: 1 }}
              helperText={imageFiles.optionImageD || imagePreviews.optionImageD ? "Text is optional when image is uploaded" : ""}
            />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="option-image-d-upload"
                type="file"
                onChange={(e) => handleImageChange('optionImageD', e.target.files?.[0] || null)}
              />
              <label htmlFor="option-image-d-upload">
                <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                  <UploadIcon sx={{ mr: 1 }} />
                  Upload Image for Option D
                </Button>
              </label>
              {imagePreviews.optionImageD && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <img
                    src={imagePreviews.optionImageD}
                    alt="Option D preview"
                    style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleImageChange('optionImageD', null)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
            <TextField
              select
              label="Correct Option"
              value={formData.correctOption}
              onChange={(e) =>
                setFormData({ ...formData, correctOption: e.target.value as 'A' | 'B' | 'C' | 'D' })
              }
              fullWidth
              required
            >
              {['A', 'B', 'C', 'D'].map((opt) => (
                <MenuItem key={opt} value={opt}>
                  Option {opt}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Marks"
              type="number"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              label="Negative Marks"
              type="number"
              value={formData.negativeMarks}
              onChange={(e) => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              label="Section (e.g., Math, English, GK/GS)"
              value={formData.section || 'General'}
              onChange={(e) =>
                setFormData({ ...formData, section: e.target.value || 'General' })
              }
              fullWidth
              placeholder="General"
              helperText="Enter section name like Math, English, GK/GS, etc."
            />
            <TextField
              label="Explanation (English)"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Explanation Image (English) - Optional
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="explanation-image-english-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleImageChange('explanationImageEnglish', file);
                  // If reuseEnglishResultImages is checked, also set Hindi preview to same image
                  if (formData.reuseEnglishResultImages && file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreviews({ ...imagePreviews, explanationImageEnglish: reader.result as string, explanationImageHindi: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                    // Also copy the file
                    setImageFiles({ ...imageFiles, explanationImageEnglish: file, explanationImageHindi: file });
                  }
                }}
              />
              <label htmlFor="explanation-image-english-upload">
                <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                  <UploadIcon sx={{ mr: 1 }} />
                  Upload Explanation Image (English)
                </Button>
              </label>
              {imagePreviews.explanationImageEnglish && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={imagePreviews.explanationImageEnglish}
                    alt="Explanation preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleImageChange('explanationImageEnglish', null)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
              Hindi Content (Optional)
            </Typography>
            <TextField
              label="Question Text (Hindi)"
              value={formData.questionTextHindi || ''}
              onChange={(e) => setFormData({ ...formData, questionTextHindi: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.reuseEnglishImages || false}
                  onChange={(e) =>
                    setFormData({ ...formData, reuseEnglishImages: e.target.checked })
                  }
                />
              }
              label="Use same images as English options for Hindi options"
            />
            <Box>
              <TextField
                label="Option A (Hindi)"
                value={formData.optionsHindi?.A || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    optionsHindi: { ...(formData.optionsHindi || { A: '', B: '', C: '', D: '' }), A: e.target.value },
                  })
                }
                fullWidth
                sx={{ mb: 1 }}
                disabled={formData.reuseEnglishImages}
              />
              {!formData.reuseEnglishImages && (
                <>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="option-image-hindi-a-upload"
                    type="file"
                    onChange={(e) => handleImageChange('optionImageHindiA', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="option-image-hindi-a-upload">
                    <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                      <UploadIcon sx={{ mr: 1 }} />
                      Upload Image for Option A (Hindi)
                    </Button>
                  </label>
                  {imagePreviews.optionImageHindiA && (
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <img
                        src={imagePreviews.optionImageHindiA}
                        alt="Option A Hindi preview"
                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleImageChange('optionImageHindiA', null)}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
            <Box>
              <TextField
                label="Option B (Hindi)"
                value={formData.optionsHindi?.B || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    optionsHindi: { ...(formData.optionsHindi || { A: '', B: '', C: '', D: '' }), B: e.target.value },
                  })
                }
                fullWidth
                sx={{ mb: 1 }}
                disabled={formData.reuseEnglishImages}
              />
              {!formData.reuseEnglishImages && (
                <>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="option-image-hindi-b-upload"
                    type="file"
                    onChange={(e) => handleImageChange('optionImageHindiB', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="option-image-hindi-b-upload">
                    <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                      <UploadIcon sx={{ mr: 1 }} />
                      Upload Image for Option B (Hindi)
                    </Button>
                  </label>
                  {imagePreviews.optionImageHindiB && (
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <img
                        src={imagePreviews.optionImageHindiB}
                        alt="Option B Hindi preview"
                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleImageChange('optionImageHindiB', null)}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
            <Box>
              <TextField
                label="Option C (Hindi)"
                value={formData.optionsHindi?.C || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    optionsHindi: { ...(formData.optionsHindi || { A: '', B: '', C: '', D: '' }), C: e.target.value },
                  })
                }
                fullWidth
                sx={{ mb: 1 }}
                disabled={formData.reuseEnglishImages}
              />
              {!formData.reuseEnglishImages && (
                <>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="option-image-hindi-c-upload"
                    type="file"
                    onChange={(e) => handleImageChange('optionImageHindiC', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="option-image-hindi-c-upload">
                    <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                      <UploadIcon sx={{ mr: 1 }} />
                      Upload Image for Option C (Hindi)
                    </Button>
                  </label>
                  {imagePreviews.optionImageHindiC && (
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <img
                        src={imagePreviews.optionImageHindiC}
                        alt="Option C Hindi preview"
                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleImageChange('optionImageHindiC', null)}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
            <Box>
              <TextField
                label="Option D (Hindi)"
                value={formData.optionsHindi?.D || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    optionsHindi: { ...(formData.optionsHindi || { A: '', B: '', C: '', D: '' }), D: e.target.value },
                  })
                }
                fullWidth
                sx={{ mb: 1 }}
                disabled={formData.reuseEnglishImages}
              />
              {!formData.reuseEnglishImages && (
                <>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="option-image-hindi-d-upload"
                    type="file"
                    onChange={(e) => handleImageChange('optionImageHindiD', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="option-image-hindi-d-upload">
                    <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                      <UploadIcon sx={{ mr: 1 }} />
                      Upload Image for Option D (Hindi)
                    </Button>
                  </label>
                  {imagePreviews.optionImageHindiD && (
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <img
                        src={imagePreviews.optionImageHindiD}
                        alt="Option D Hindi preview"
                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleImageChange('optionImageHindiD', null)}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
            <TextField
              label="Explanation (Hindi)"
              value={formData.explanationHindi || ''}
              onChange={(e) => setFormData({ ...formData, explanationHindi: e.target.value })}
              fullWidth
              multiline
              rows={3}
              disabled={formData.reuseEnglishResultImages}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.reuseEnglishResultImages || false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({ ...formData, reuseEnglishResultImages: checked });
                    // If checked, copy English solution image to Hindi preview and files
                    if (checked) {
                      if (imagePreviews.solutionImageEnglish) {
                        setImagePreviews({ ...imagePreviews, solutionImageHindi: imagePreviews.solutionImageEnglish });
                      }
                      if (imageFiles.solutionImageEnglish) {
                        setImageFiles({ ...imageFiles, solutionImageHindi: imageFiles.solutionImageEnglish });
                      }
                      if (imagePreviews.explanationImageEnglish) {
                        setImagePreviews({ ...imagePreviews, explanationImageHindi: imagePreviews.explanationImageEnglish });
                      }
                      if (imageFiles.explanationImageEnglish) {
                        setImageFiles({ ...imageFiles, explanationImageHindi: imageFiles.explanationImageEnglish });
                      }
                    } else {
                      // If unchecked, clear Hindi images
                      const newPreviews = { ...imagePreviews };
                      delete newPreviews.solutionImageHindi;
                      delete newPreviews.explanationImageHindi;
                      setImagePreviews(newPreviews);
                      const newFiles = { ...imageFiles };
                      delete newFiles.solutionImageHindi;
                      delete newFiles.explanationImageHindi;
                      setImageFiles(newFiles);
                    }
                  }}
                />
              }
              label="Use same explanation and solution/result images for Hindi as English"
            />
            {!formData.reuseEnglishResultImages && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Explanation Image (Hindi) - Optional
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="explanation-image-hindi-upload"
                  type="file"
                  onChange={(e) => handleImageChange('explanationImageHindi', e.target.files?.[0] || null)}
                />
                <label htmlFor="explanation-image-hindi-upload">
                  <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                    <UploadIcon sx={{ mr: 1 }} />
                    Upload Explanation Image (Hindi)
                  </Button>
                </label>
                {imagePreviews.explanationImageHindi && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={imagePreviews.explanationImageHindi}
                      alt="Explanation Hindi preview"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleImageChange('explanationImageHindi', null)}
                      sx={{ mt: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
              Solution (Detailed Explanation / Result)
            </Typography>
            <TextField
              label="Solution (English)"
              value={formData.solution?.english || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  solution: { ...(formData.solution || { english: '', hindi: '' }), english: e.target.value },
                })
              }
              fullWidth
              multiline
              rows={4}
              helperText="Detailed solution/result explaining why the answer is correct"
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Solution/Result Image (English) - Optional
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="solution-image-english-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleImageChange('solutionImageEnglish', file);
                  // If reuseEnglishResultImages is checked, also set Hindi preview to same image
                  if (formData.reuseEnglishResultImages && file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreviews({ ...imagePreviews, solutionImageEnglish: reader.result as string, solutionImageHindi: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label htmlFor="solution-image-english-upload">
                <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                  <UploadIcon sx={{ mr: 1 }} />
                  Upload Solution/Result Image (English)
                </Button>
              </label>
              {imagePreviews.solutionImageEnglish && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={imagePreviews.solutionImageEnglish}
                    alt="Solution preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      handleImageChange('solutionImageEnglish', null);
                      if (formData.reuseEnglishResultImages) {
                        handleImageChange('solutionImageHindi', null);
                      }
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
            <TextField
              label="Solution (Hindi)"
              value={formData.solution?.hindi || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  solution: { ...(formData.solution || { english: '', hindi: '' }), hindi: e.target.value },
                })
              }
              fullWidth
              multiline
              rows={4}
              helperText="Detailed solution/result in Hindi"
              disabled={formData.reuseEnglishResultImages}
            />
            {!formData.reuseEnglishResultImages && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Solution/Result Image (Hindi) - Optional
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="solution-image-hindi-upload"
                  type="file"
                  onChange={(e) => handleImageChange('solutionImageHindi', e.target.files?.[0] || null)}
                />
                <label htmlFor="solution-image-hindi-upload">
                  <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
                    <UploadIcon sx={{ mr: 1 }} />
                    Upload Solution/Result Image (Hindi)
                  </Button>
                </label>
                {imagePreviews.solutionImageHindi && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={imagePreviews.solutionImageHindi}
                      alt="Solution Hindi preview"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleImageChange('solutionImageHindi', null)}
                      sx={{ mt: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            {formData.reuseEnglishResultImages && imagePreviews.solutionImageEnglish && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  ✓ Using same Solution/Result image for Hindi as English
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <img
                    src={imagePreviews.solutionImageEnglish}
                    alt="Solution preview (used for both languages)"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting}
            sx={{ 
              textTransform: 'none', 
              px: 3,
              fontWeight: 600,
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                {editingQuestion ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingQuestion ? 'Update Question' : 'Create Question'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this question? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

