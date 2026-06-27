import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useParams, Link } from 'react-router-dom';
import { AttendanceTableClient } from '../components/modules/AttendanceTableClient';
import { Button } from "@/components/ui/button"
import { ArrowLeft, ZoomIn, X } from "lucide-react"
import { getImageUrl } from '../lib/utils';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog"

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
        {getImageUrl(meeting.photoUrl) && (
          <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${getImageUrl(meeting.photoUrl)})` }} />
        )}
        <Link to="/meetings" className="relative z-10">
          <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {getImageUrl(meeting.photoUrl) && (
          <Dialog>
            <DialogTrigger className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-lg group cursor-pointer border-2 border-white/10 hover:border-white/30 transition-all flex-shrink-0">
              <img src={getImageUrl(meeting.photoUrl)} alt={meeting.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="text-white w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
              </div>
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="fixed inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 max-w-none w-screen h-screen bg-black/90 flex items-center justify-center p-4 rounded-none border-none ring-0 focus-visible:ring-0 cursor-zoom-out z-[9999]">
              <DialogClose render={<div className="w-full h-full flex items-center justify-center relative outline-none cursor-zoom-out" />}>
                <div className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer shadow-lg z-50">
                  <X className="w-5 h-5" />
                </div>
                <img src={getImageUrl(meeting.photoUrl)} alt={meeting.title} className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/5 cursor-zoom-out" />
              </DialogClose>
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
