# Test Series Admin Panel

A complete Next.js 14 admin panel for managing a Test Series platform, built with TypeScript, Material UI, and Tailwind CSS.

## Features

### Authentication & Security
- Admin login with JWT authentication
- Cookie-based token storage
- Role-based access control (ADMIN only)
- Protected routes using Next.js middleware
- Auto logout on token expiry

### Dashboard
- Overview statistics (Users, Exams, Tests, Questions)
- Visual charts and graphs
- Recent activity tracking
- Quick action buttons

### Exam Management
- Create, edit, and delete exams
- Publish/Unpublish exams
- Filter and search exams
- Manage exam categories and languages
- Set exam duration and total marks

### Test Management
- Create tests under exams
- Edit and delete tests
- Reorder tests (order field)
- Mark tests as free or paid
- Set test duration, marks, and questions count

### Question Management
- Add questions using form
- Edit and delete questions
- List questions by test
- Manage question options (A, B, C, D)
- Set correct answer and marking scheme
- Set negative marking

### Bulk Question Upload
- Upload CSV or Excel files
- Preview parsed questions
- Validate rows before submission
- Show row-wise errors
- Submit only valid questions

### Analytics & Results
- View test attempts
- Test-wise performance metrics
- Score distribution charts
- User ranking
- Exam analytics
- Detailed attempt statistics

## Tech Stack

- **Next.js 14** - App Router, Server Components
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material UI (MUI)** - Component library
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **React Hook Form + Zod** - Form validation
- **Recharts** - Data visualization
- **PapaParse** - CSV parsing
- **XLSX** - Excel file parsing

## Project Structure

```
admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── exams/
│   │   │   ├── tests/
│   │   │   ├── questions/
│   │   │   │   └── bulk-upload/
│   │   │   └── analytics/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── api/
│   │   ├── axios.ts
│   │   ├── auth.api.ts
│   │   ├── exam.api.ts
│   │   ├── test.api.ts
│   │   ├── question.api.ts
│   │   └── analytics.api.ts
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── AdminLayout.tsx
│   ├── constants/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── cookies.ts
│   ├── styles/
│   │   └── theme.ts
│   └── middleware.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## Installation

1. **Navigate to admin directory**
   ```bash
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3001`

## Configuration

### API Configuration

Update the API base URL in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://your-backend-url/api
```

### Authentication

The admin panel uses JWT tokens stored in cookies. The middleware automatically:
- Redirects unauthenticated users to login
- Redirects authenticated users away from login page
- Handles token expiry

## Usage

### Login

1. Navigate to `/login`
2. Enter admin credentials (must have ADMIN role)
3. Upon successful login, you'll be redirected to dashboard

### Managing Exams

1. Go to **Exams** from sidebar
2. Click **Create Exam** to add new exam
3. Fill in exam details (title, category, language, etc.)
4. Click **Publish** to make exam visible to users
5. Use **Edit** or **Delete** buttons for existing exams

### Managing Tests

1. Go to **Tests** from sidebar
2. Select an exam from dropdown
3. Click **Create Test** to add test under selected exam
4. Set test properties (name, duration, marks, free/paid)
5. Set order number for test sequence

### Managing Questions

1. Go to **Questions** from sidebar
2. Select exam and test from dropdowns
3. Click **Add Question** to create individual question
4. Fill in question text, options, correct answer, and marking scheme
5. Use **Bulk Upload** for adding multiple questions at once

### Bulk Question Upload

1. Go to **Questions** → **Bulk Upload**
2. Select exam and test
3. Prepare CSV/Excel file with required columns:
   - `questionText` - The question text
   - `optionA`, `optionB`, `optionC`, `optionD` - Answer options
   - `correctOption` - A, B, C, or D
   - `marks` - Marks for correct answer
   - `negativeMarks` - Negative marks for wrong answer
   - `order` - Question order number
   - `explanation` - Optional explanation
4. Upload file and review parsed questions
5. Fix any validation errors
6. Click **Upload Valid Questions** to submit

### Viewing Analytics

1. Go to **Analytics** from sidebar
2. Select exam and test
3. View:
   - Test performance overview
   - Score distribution charts
   - Recent test attempts
   - User rankings
   - Exam-level statistics

## API Integration

The admin panel integrates with the backend API through:

- **Centralized API client** (`src/api/axios.ts`)
- **Automatic token injection** via interceptors
- **Error handling** and token refresh
- **Type-safe API calls** with TypeScript

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## File Upload Format

### CSV Format
```csv
questionText,optionA,optionB,optionC,optionD,correctOption,marks,negativeMarks,order,explanation
"What is 2+2?","2","3","4","5","C",1,0,1,"Basic addition"
```

### Excel Format
Same columns as CSV, with headers in first row.

## Security Features

- JWT token-based authentication
- Cookie-based token storage (httpOnly in production)
- Role-based access control
- Protected routes via middleware
- Automatic token validation
- Secure API communication

## Troubleshooting

### API Connection Issues

1. Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
2. Ensure backend server is running
3. Verify CORS settings on backend

### Authentication Issues

1. Clear browser cookies
2. Check token expiry
3. Verify user has ADMIN role

### File Upload Issues

1. Ensure file format matches required columns
2. Check file encoding (UTF-8 recommended)
3. Verify file size limits

## License

ISC

## Support

For issues and questions, please contact the development team.

