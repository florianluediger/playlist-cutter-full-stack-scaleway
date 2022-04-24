import {GenerationStatus} from "./GenerationStatus";
import {ReactComponent as Knife} from "../knife.svg";

export function PlaylistGeneration({
                                       generationStatus
                                   }: {
    generationStatus: GenerationStatus
}) {
    let message;
    switch (generationStatus) {
        case GenerationStatus.FETCH_INCLUDE:
            message = "Fetching songs to include in your new playlist"
            break;
        case GenerationStatus.FETCH_EXCLUDE:
            message = "Fetching songs to exclude from your new playlist"
            break;
        case GenerationStatus.CALCULATE_DIFFERENCE:
            message = "Calculating the difference between the playlists"
            break;
        case GenerationStatus.CREATE_NEW:
            message = "Adding your favorite songs to your new playlist"
    }
    return (
        <div className="flex justify-center items-center pt-10">
            <div className="rounded-md overflow-hidden border">
                <div className="m-5">
                    <div className="flex flex-col justify-center items-center">
                        <div className="relative w-32 h-32">
                            <div className="animate-bounce-spin-bounce absolute">
                                <div className="animate-bounce-spin-spin">
                                    <Knife width="128" height="128"/>
                                </div>
                            </div>
                        </div>
                        <div className="mt-10">
                            <p>{message}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlaylistGeneration