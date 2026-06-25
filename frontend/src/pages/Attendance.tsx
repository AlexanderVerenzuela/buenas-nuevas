import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useParams, Link } from 'react-router-dom';
import { AttendanceTableClient } from '../components/modules/AttendanceTableClient';
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function Attendance() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [youthList, setYouthList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!meetingId) return;
      try {
        const [meetingData, youthData] = await Promise.all([
          request(`/meetings/${meetingId}`),
          request(`/meetings/${meetingId}/attendance`)
        ]);
        setMeeting(meetingData);
        setYouthList(youthData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceData();
  }, [meetingId]);

  if (loading) return <div>Cargando datos de asistencia...</div>;
  if (!meeting) return <div>Reunión no encontrada.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-6 border rounded-xl bg-card shadow-sm relative overflow-hidden">
        {meeting.photoUrl && (
          <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(http://localhost:5000${meeting.photoUrl})` }} />
        )}
        <Link to="/meetings" className="relative z-10">
          <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {meeting.photoUrl && (
          <div className="relative z-10 w-24 h-24 rounded-lg overflow-hidden shadow-md hidden sm:block">
            <img src={`http://localhost:5000${meeting.photoUrl}`} alt={meeting.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pasar Lista: {meeting.title}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(meeting.date).toLocaleDateString()} {meeting.time && `a las ${meeting.time}`}
          </p>
        </div>
      </div>

      <AttendanceTableClient meetingId={meetingId!} initialYouthList={youthList} />
    </div>
  )
}
