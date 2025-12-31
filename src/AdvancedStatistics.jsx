// 📊 ADVANCED STATISTICS with HEATMAP
import { useState, useEffect } from 'react';
import { BarChart2, Calendar, TrendingUp, Clock, Book, Target, Award } from 'lucide-react';

export function AdvancedStatisticsView({ user, userData, books, showToast }) {
  const [timeRange, setTimeRange] = useState('year');
  const [heatmapData, setHeatmapData] = useState([]);
  
  useEffect(() => {
    generateHeatmapData();
  }, [books, timeRange]);
  
  const generateHeatmapData = () => {
    const days = timeRange === 'year' ? 365 : 90;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate reading data (replace with real data from Firebase)
      const pagesRead = Math.floor(Math.random() * 50);
      const minutesRead = Math.floor(Math.random() * 120);
      
      data.push({
        date: dateStr,
        pagesRead,
        minutesRead,
        level: pagesRead === 0 ? 0 : pagesRead < 10 ? 1 : pagesRead < 25 ? 2 : pagesRead < 40 ? 3 : 4
      });
    }
    
    setHeatmapData(data);
  };
  
  const stats = {
    totalPages: books.reduce((sum, book) => sum + book.currentPage, 0),
    totalBooks: books.length,
    booksFinished: books.filter(b => b.status === 'finished').length,
    avgPagesPerDay: Math.floor(books.reduce((sum, book) => sum + book.currentPage, 0) / 365),
    readingSpeed: 45, // pages per hour (calculate from timer data)
    favoriteGenre: 'Fiction',
    longestStreak: userData?.longestStreak || 0,
    currentStreak: userData?.streak || 0
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Advanced Statistics</h1>
        <p className="page-subtitle">Deep insights into your reading habits</p>
      </div>
      
      {/* Quick Stats Grid */}
      <div className="desktop-grid-4" style={{ marginBottom: 30 }}>
        <div className="stat-card">
          <div className="stat-value">{stats.totalPages.toLocaleString()}</div>
          <div className="stat-label">Total Pages</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.booksFinished}</div>
          <div className="stat-label">Books Finished</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgPagesPerDay}</div>
          <div className="stat-label">Avg Pages/Day</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.readingSpeed}</div>
          <div className="stat-label">Pages/Hour</div>
        </div>
      </div>
      
      {/* Reading Heatmap */}
      <div className="cozy-card" style={{ padding: 24, marginBottom: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
            <Calendar size={20} style={{ display: 'inline', marginRight: 8 }} />
            Reading Activity
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setTimeRange('year')}
              className={`btn-ghost ${timeRange === 'year' ? 'active' : ''}`}
            >
              Year
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`btn-ghost ${timeRange === 'quarter' ? 'active' : ''}`}
            >
              3 Months
            </button>
          </div>
        </div>
        
        <ReadingHeatmap data={heatmapData} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: '12px', opacity: 0.6 }}>
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: level === 0 ? 'rgba(255,255,255,0.1)' : `rgba(var(--accent-rgb), ${0.2 + level * 0.2})`
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="desktop-grid-2" style={{ marginBottom: 30 }}>
        <div className="cozy-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20 }}>
            📈 Pages Per Month
          </h3>
          <PagesPerMonthChart />
        </div>
        
        <div className="cozy-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20 }}>
            📚 Books Per Month
          </h3>
          <BooksPerMonthChart />
        </div>
      </div>
      
      {/* Reading Patterns */}
      <div className="desktop-grid-2" style={{ marginBottom: 30 }}>
        <div className="cozy-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20 }}>
            ⏰ Best Reading Times
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { time: '6-9 AM', percentage: 15 },
              { time: '9-12 PM', percentage: 25 },
              { time: '12-3 PM', percentage: 10 },
              { time: '3-6 PM', percentage: 20 },
              { time: '6-9 PM', percentage: 45 },
              { time: '9-12 AM', percentage: 60 }
            ].map(slot => (
              <div key={slot.time}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '14px' }}>
                  <span>{slot.time}</span>
                  <span>{slot.percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${slot.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="cozy-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20 }}>
            🎭 Genre Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { genre: 'Fiction', count: 45, color: '#FF6B6B' },
              { genre: 'Non-Fiction', count: 30, color: '#4ECDC4' },
              { genre: 'Sci-Fi', count: 25, color: '#45B7D1' },
              { genre: 'Mystery', count: 20, color: '#FFA07A' },
              { genre: 'Romance', count: 15, color: '#DDA15E' }
            ].map(genre => (
              <div key={genre.genre}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '14px' }}>
                  <span>{genre.genre}</span>
                  <span>{genre.count} books</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(genre.count / 45) * 100}%`, background: genre.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Milestones */}
      <div className="cozy-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20 }}>
          🏆 Recent Milestones
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { text: '1000 pages read', date: '2 days ago', icon: '📖' },
            { text: '10 books finished', date: '1 week ago', icon: '🎉' },
            { text: '30 day streak', date: '2 weeks ago', icon: '🔥' },
            { text: 'Joined book club', date: '3 weeks ago', icon: '👥' }
          ].map((milestone, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
              <div style={{ fontSize: '24px' }}>{milestone.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600' }}>{milestone.text}</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>{milestone.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReadingHeatmap({ data }) {
  const weeks = [];
  let currentWeek = [];
  
  data.forEach((day, index) => {
    currentWeek.push(day);
    if ((index + 1) % 7 === 0 || index === data.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });
  
  return (
    <div style={{ display: 'flex', gap: 3, overflowX: 'auto', padding: 4 }}>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {week.map((day, dayIndex) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.pagesRead} pages`}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: day.level === 0 
                  ? 'rgba(255,255,255,0.1)' 
                  : `rgba(147, 51, 234, ${0.2 + day.level * 0.2})`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.5)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function PagesPerMonthChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [450, 520, 380, 600, 720, 680, 590, 650, 700, 620, 580, 640];
  const max = Math.max(...data);
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
      {data.map((pages, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: '100%',
              height: `${(pages / max) * 180}px`,
              background: 'var(--grad-main)',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 8,
              fontSize: '10px',
              fontWeight: 'bold'
            }}
          >
            {pages}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.6 }}>{months[i]}</div>
        </div>
      ))}
    </div>
  );
}

function BooksPerMonthChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [3, 4, 2, 5, 6, 5, 4, 5, 6, 5, 4, 5];
  const max = Math.max(...data);
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
      {data.map((books, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: '100%',
              height: `${(books / max) * 180}px`,
              background: 'var(--accent)',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 8,
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {books}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.6 }}>{months[i]}</div>
        </div>
      ))}
    </div>
  );
}

export default AdvancedStatisticsView;
