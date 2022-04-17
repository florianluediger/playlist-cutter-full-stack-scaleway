import {GenerationStatus} from "./GenerationStatus";

export function PlaylistGeneration({
                                       generationStatus
                                   }: {
    generationStatus: GenerationStatus
}) {
    return <p>{generationStatus}</p>
}

export default PlaylistGeneration