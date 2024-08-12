import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const NavBar = () => (
  <nav className="bg-gray-800 text-white p-4">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center">
        <svg className="h-8 w-8 mr-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-gray-300">Dashboard</a>
          <a href="#" className="hover:text-gray-300">Submission</a>
          <a href="#" className="hover:text-gray-300">Students</a>
          <a href="#" className="hover:text-gray-300">Settings</a>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" className="text-gray-300 border-gray-300 hover:bg-gray-700 hover:text-white">Login</Button>
        <Button variant="outline" className="text-gray-300 border-gray-300 hover:bg-gray-700 hover:text-white">Logout</Button>
      </div>
    </div>
  </nav>
);

const DatePickerWithRange = ({ date, setDate }) => {
  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const Index = () => {
  const [reportIdFilter, setReportIdFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  const fetchReports = async () => {
    // Simulated API call
    return [
      { id: '001', submittedTime: '2023-04-15T10:30:00Z' },
      { id: '002', submittedTime: '2023-04-16T14:45:00Z' },
      { id: '003', submittedTime: '2023-04-17T09:15:00Z' },
    ];
  };

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });

  const filteredReports = reports.filter(report => {
    const matchesId = report.id.includes(reportIdFilter);
    const submittedDate = new Date(report.submittedTime);
    const isInDateRange = (!dateRange.from || submittedDate >= dateRange.from) &&
                          (!dateRange.to || submittedDate <= dateRange.to);
    return matchesId && isInDateRange;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'ascending' ? <ChevronUp className="inline-block w-4 h-4" /> : <ChevronDown className="inline-block w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main className="container mx-auto mt-8 p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 flex justify-between items-center">
            <Input
              placeholder="Filter by Report ID"
              value={reportIdFilter}
              onChange={(e) => setReportIdFilter(e.target.value)}
              className="max-w-sm"
            />
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('id')} className="cursor-pointer">
                  Report ID {getSortIcon('id')}
                </TableHead>
                <TableHead onClick={() => requestSort('submittedTime')} className="cursor-pointer">
                  Submitted Time {getSortIcon('submittedTime')}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{new Date(report.submittedTime).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="outline">View Report</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Index;
