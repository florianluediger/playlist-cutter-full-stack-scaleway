import { ReactComponent as Knife } from "../knife.svg";

export function PlaylistGeneration() {
  return (
    <div className="flex justify-center items-center pt-10">
      <div className="rounded-md overflow-hidden border">
        <div className="m-5">
          <div className="flex flex-col justify-center items-center">
            <div className="relative w-32 h-32">
              <div className="animate-bounce-spin-bounce absolute">
                <div className="animate-bounce-spin-spin">
                  <Knife width="128" height="128" />
                </div>
              </div>
            </div>
            <div className="mt-10">
              <p>Adding your favorite songs to your new playlist</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaylistGeneration;
