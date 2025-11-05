import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import AddExpense from './pages/AddExpense'
import ExpenseDetail from './pages/ExpenseDetail'
import Statistics from './pages/Statistics'
import SplitManagement from './pages/SplitManagement'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddExpense />} />
          <Route path="/expense/:id" element={<ExpenseDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/split" element={<SplitManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
