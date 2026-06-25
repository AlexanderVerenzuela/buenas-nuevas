import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useParams, Link } from 'react-router-dom';
import { AttendanceTableClient } from '../components/modules/AttendanceTableClient';
import { Button } from "@/components/ui/button"
import { ArrowLeft, ZoomIn } from "lucide-react"
import { getImageUrl } from '../lib/utils';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

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
          <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${getImageUrl(meeting.photoUrl)})` }} />
        )}
        <Link to="/meetings" className="relative z-10">
          <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {meeting.photoUrl && (
          <Dialog>
            <DialogTrigger className="relative z-10 w-24 h-24 rounded-xl overflow-hidden shadow-lg hidden sm:block group cursor-pointer border-2 border-white/10 hover:border-white/30 transition-all">
              <img src={getImageUrl(meeting.photoUrl)} alt={meeting.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="text-white w-6 h-6 drop-shadow-md" />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[90vw] h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center">
              <img src={getImageUrl(meeting.photoUrl)} alt={meeting.title} className="w-full h-full object-contain drop-shadow-2xl" />
            </DialogContent>
          </Dialog>
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
