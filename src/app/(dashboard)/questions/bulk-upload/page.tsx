'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Upload as UploadIcon, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { questionApi } from '@/api/question.api';
import { examApi } from '@/api/exam.api';
import { testApi } from '@/api/test.api';
import { BulkQuestionData, CreateQuestionData, Exam, Test } from '@/types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ParsedQuestion extends BulkQuestionData {
  _rowIndex: number;
  _errors: string[];
  _isValid: boolean;
}

export default function BulkUploadPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadTests();
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      const response = await examApi.getExams({ limit: 100 });
      // Backend returns { exams: Exam[], pagination: {...} }
      const examsData = response?.exams || [];
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (error: any) {
      console.error('Failed to load exams:', error);
      setError(error.message || 'Failed to load exams');
      setExams([]);
    }
  };

  const loadTests = async () => {
    if (!selectedExamId) {
      setTests([]);
      return;
    }
    try {
      const response = await testApi.getTests(selectedExamId, { limit: 100 });
      // Backend returns { tests: Test[], pagination: {...} }
      const testsData = response?.tests || [];
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error: any) {
      console.error('Failed to load tests:', error);
      setError(error.message || 'Failed to load tests');
      setTests([]);
    }
  };

  const validateQuestion = (row: any, index: number): ParsedQuestion => {
    const errors: string[] = [];
    const question: ParsedQuestion = {
      _rowIndex: index + 1,
      _errors: [],
      _isValid: true,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      explanation: '',
      marks: 1,
      negativeMarks: 0,
      order: index + 1,
    };

    // Validate questionText
    if (!row.questionText || !row.questionText.trim()) {
      errors.push('Question text is required');
    } else {
      question.questionText = row.questionText.trim();
    }

    // Validate options
    ['A', 'B', 'C', 'D'].forEach((opt) => {
      const key = `option${opt}` as keyof typeof row;
      if (!row[key] || !row[key].trim()) {
        errors.push(`Option ${opt} is required`);
      } else {
        const optionKey = `option${opt}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';
        question[optionKey] = row[key].trim();
      }
    });

    // Validate correctOption
    const correctOpt = (row.correctOption || '').toString().toUpperCase().trim();
    if (!['A', 'B', 'C', 'D'].includes(correctOpt)) {
      errors.push('Correct option must be A, B, C, or D');
    } else {
      question.correctOption = correctOpt as 'A' | 'B' | 'C' | 'D';
    }

    // Validate marks
    const marks = parseFloat(row.marks);
    if (isNaN(marks) || marks < 0) {
      errors.push('Marks must be a valid number >= 0');
    } else {
      question.marks = marks;
    }

    // Validate negativeMarks
    const negativeMarks = parseFloat(row.negativeMarks || '0');
    if (isNaN(negativeMarks) || negativeMarks < 0) {
      errors.push('Negative marks must be a valid number >= 0');
    } else {
      question.negativeMarks = negativeMarks;
    }

    // Optional fields
    question.explanation = row.explanation?.trim() || '';
    question.order = parseInt(row.order) || index + 1;

    question._errors = errors;
    question._isValid = errors.length === 0;

    return question;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setParsedQuestions([]);
    setLoading(true);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const questions: ParsedQuestion[] = results.data.map((row: any, index: number) =>
            validateQuestion(row, index)
          );
          setParsedQuestions(questions);
          setShowPreview(true);
          setLoading(false);
        },
        error: (error) => {
          setError('Failed to parse CSV file: ' + error.message);
          setLoading(false);
        },
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const questions: ParsedQuestion[] = jsonData.map((row: any, index: number) =>
            validateQuestion(row, index)
          );
          setParsedQuestions(questions);
          setShowPreview(true);
          setLoading(false);
        } catch (error: any) {
          setError('Failed to parse Excel file: ' + error.message);
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file format. Please upload CSV or Excel file.');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTestId) {
      setError('Please select a test');
      return;
    }

    const validQuestions = parsedQuestions.filter((q) => q._isValid);
    if (validQuestions.length === 0) {
      setError('No valid questions to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const questionsToSubmit: CreateQuestionData[] = validQuestions.map((q) => ({
        questionText: q.questionText,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD,
        },
        correctOption: q.correctOption,
        explanation: q.explanation,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        testId: selectedTestId,
        order: q.order,
      }));

      await questionApi.bulkCreateQuestions(questionsToSubmit);
      setSuccess(`Successfully uploaded ${validQuestions.length} questions`);
      setParsedQuestions([]);
      setShowPreview(false);
    } catch (error: any) {
      setError(error.message || 'Failed to upload questions');
    } finally {
      setUploading(false);
    }
  };

  const validCount = parsedQuestions.filter((q) => q._isValid).length;
  const invalidCount = parsedQuestions.length - validCount;

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Bulk Question Upload
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Select Exam"
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setSelectedTestId('');
              }}
              sx={{ minWidth: 200 }}
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
            >
              {tests && Array.isArray(tests) ? tests.map((test) => (
                test ? (
                  <MenuItem key={test._id} value={test._id}>
                    {test.testName || 'Untitled'}
                  </MenuItem>
                ) : null
              )) : null}
            </TextField>
          </Box>

          <Box>
            <input
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                disabled={!selectedTestId || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload CSV/Excel File'}
              </Button>
            </label>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Supported formats: CSV, Excel (.xlsx, .xls)
              <br />
              Required columns: questionText, optionA, optionB, optionC, optionD, correctOption, marks, negativeMarks, order
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {parsedQuestions.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  icon={<CheckCircle />}
                  label={`${validCount} Valid`}
                  color="success"
                />
                <Chip
                  icon={<ErrorIcon />}
                  label={`${invalidCount} Invalid`}
                  color="error"
                />
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Question</TableCell>
                      <TableCell>Correct</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Errors</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedQuestions.map((question) => (
                      <TableRow key={question._rowIndex}>
                        <TableCell>{question._rowIndex}</TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" noWrap>
                            {question.questionText}
                          </Typography>
                        </TableCell>
                        <TableCell>{question.correctOption}</TableCell>
                        <TableCell>
                          <Chip
                            label={question._isValid ? 'Valid' : 'Invalid'}
                            color={question._isValid ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {question._errors.length > 0 && (
                            <Typography variant="caption" color="error">
                              {question._errors.join(', ')}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={validCount === 0 || uploading || !selectedTestId}
                >
                  {uploading ? <CircularProgress size={24} /> : `Upload ${validCount} Valid Questions`}
                </Button>
                <Button variant="outlined" onClick={() => setParsedQuestions([])}>
                  Clear
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </AdminLayout>
  );
}

