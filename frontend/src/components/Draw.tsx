
import { TLComponents, Tldraw, TldrawProps } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'

// Define role types
type UserRole = 'teacher' | 'student'

interface DrawProps {
  role?: UserRole;
  roomId: string;
}

const components: TLComponents = {
  CollaboratorHint: null,
  Grid: null,

}

const Draw = ({ role, roomId }: DrawProps) => {
  const store = useSyncDemo({ roomId })


  const tldrawProps: Partial<TldrawProps> = {
    components,
    store,
    hideUi: true
  }


  return (
    <div
      className="w-full  h-[78vh]  pointer-events-none"
      style={{ pointerEvents: role !== "teacher" ? "none" : "auto" }}
    >

      {role != "teacher" ? <Tldraw {...tldrawProps} /> : <Tldraw store={store} />}
    </div >
  )
}

export default Draw
