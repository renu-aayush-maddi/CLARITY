import { Upload, ChevronDown, Check, Search } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// Mock list of 25 studies (You would likely fetch this from API in real app)
const ALL_STUDIES = Array.from({length: 25}, (_, i) => `Study ${i + 1}`);

export default function Header({ study, setStudy, handleUpload, isUploading }) {
  const fileInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const filteredStudies = ALL_STUDIES.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="top-bar">
      <div className="page-title">
        <h1>Clinical Operations Overview</h1>
        <p>Real-time oversight for <strong>{study}</strong></p>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        
        {/* CUSTOM SEARCHABLE DROPDOWN */}
        <div className="study-selector-container" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 15px', background: 'white', border: '1px solid #e2e8f0',
                    borderRadius: '8px', cursor: 'pointer', minWidth: '180px', justifyContent: 'space-between'
                }}
            >
                <span style={{fontWeight: 600}}>{study}</span>
                <ChevronDown size={16} color="#64748b"/>
            </button>

            {isOpen && (
                <div className="study-menu">
                    <div style={{position: 'relative'}}>
                        <Search size={14} style={{position: 'absolute', left: '10px', top: '12px', color: '#94a3b8'}}/>
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Search study..." 
                            className="study-search"
                            style={{paddingLeft: '30px'}}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="study-list">
                        {filteredStudies.map(s => (
                            <div 
                                key={s} 
                                className={`study-option ${study === s ? 'active' : ''}`}
                                onClick={() => { setStudy(s); setIsOpen(false); setSearchTerm(""); }}
                            >
                                {s}
                            </div>
                        ))}
                        {filteredStudies.length === 0 && (
                            <div style={{padding: '10px', color: '#94a3b8', fontSize: '0.85rem'}}>No study found</div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Upload Button */}
        <input type="file" multiple onChange={handleUpload} style={{ display: 'none' }} ref={fileInputRef} />
        <button className="btn btn-primary" onClick={() => fileInputRef.current.click()} disabled={isUploading}>
          {isUploading ? "Ingesting..." : <><Upload size={18}/> Ingest Data</>}
        </button>
      </div>
    </div>
  );
}