import { fireEvent, render, screen } from "@testing-library/react";
import { PlaylistList } from "./PlaylistList";

global.alert = jest.fn();

let playlists = [
  {
    id: "plist1Id",
    name: "plist1",
    external_urls: {
      spotify: "spotify_url_1",
    },
    tracks: {
      href: "href",
      total: 0,
    },
  },
  {
    id: "plist2Id",
    name: "plist2",
    external_urls: {
      spotify: "spotify_url_2",
    },
    tracks: {
      href: "href",
      total: 0,
    },
  },
  {
    id: "plist3Id",
    name: "plist3",
    external_urls: {
      spotify: "spotify_url_3",
    },
    tracks: {
      href: "href",
      total: 0,
    },
  },
];

describe("PlaylistList", () => {
  it("renders list of checkbox items and calls setCheckedList when checking a checkbox", () => {
    let checkedPlaylists = ["plist3Id"];
    let setCheckedList = jest.fn();

    render(
      <PlaylistList
        checkedPlaylists={checkedPlaylists}
        setCheckedList={setCheckedList}
        playlists={playlists}
      />
    );

    expect(screen.getByText("plist1")).toBeInTheDocument();
    expect(screen.getByText("plist2")).toBeInTheDocument();
    expect(screen.getByText("plist3")).toBeInTheDocument();

    let checkboxes: HTMLInputElement[] = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toEqual(3);
    expect(checkboxes[0].checked).toEqual(false);

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0].checked).toEqual(true);
    expect(setCheckedList).toHaveBeenCalledTimes(1);
    expect(setCheckedList).toHaveBeenCalledWith(["plist3Id", "plist1Id"]);
  });

  it("renders list of checkbox items and calls setCheckedList when unchecking a checkbox", () => {
    let checkedPlaylists = ["plist3Id"];
    let setCheckedList = jest.fn();

    render(
      <PlaylistList
        checkedPlaylists={checkedPlaylists}
        setCheckedList={setCheckedList}
        playlists={playlists}
      />
    );

    expect(screen.getByText("plist1")).toBeInTheDocument();
    expect(screen.getByText("plist2")).toBeInTheDocument();
    expect(screen.getByText("plist3")).toBeInTheDocument();

    let checkboxes: HTMLInputElement[] = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toEqual(3);
    expect(checkboxes[2].checked).toEqual(false);

    fireEvent.click(checkboxes[2]);
    fireEvent.click(checkboxes[2]);
    expect(checkboxes[2].checked).toEqual(false);
    expect(setCheckedList).toHaveBeenCalledTimes(2);
    expect(setCheckedList).toHaveBeenCalledWith([]);
  });

  it("renders loading message when no playlists found", () => {
    let setCheckedList = jest.fn();

    render(
      <PlaylistList
        checkedPlaylists={[]}
        setCheckedList={setCheckedList}
        playlists={[]}
      />
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
