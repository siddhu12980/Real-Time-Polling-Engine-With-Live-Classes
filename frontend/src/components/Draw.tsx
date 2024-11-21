// import { Excalidraw } from "@excalidraw/excalidraw";
// import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

import { Tldraw } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'



const Draw = () => {
    const store = useSyncDemo({ roomId: 'myapp-abc123' })

    // const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

    return (
        <div className="w-[100%] h-[1000px]">
            <Tldraw store={store} />
        </div>

    );
};

export default Draw;
