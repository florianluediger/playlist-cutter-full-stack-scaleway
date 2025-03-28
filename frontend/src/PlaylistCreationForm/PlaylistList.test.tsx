import {fireEvent, render, screen} from "@testing-library/react";
import {PlaylistList} from "./PlaylistList";
import {usePlaylists} from "./usePlaylists";
import {useAuth} from "react-oauth2-pkce";

jest.mock("react-oauth2-pkce", () => {
    return {
        useAuth: jest.fn()
    }
})

jest.mock("./usePlaylists", () => {
    return {
        usePlaylists: jest.fn()
    }
})

global.alert = jest.fn()

let logoutFunction = jest.fn();

let useAuthResult = {
    authService: {
        getAuthTokens: () => {
            return {access_token: "access_token"}
        },
        logout: logoutFunction
    }
};

let successfulUsePlaylistResult = {
    playlists: [
        {
            id: "plist1Id",
            name: "plist1",
            external_urls: {
                spotify: "spotify_url_1"
            },
            tracks: {
                href: "href",
                total: 0
            }
        },
        {
            id: "plist2Id",
            name: "plist2",
            external_urls: {
                spotify: "spotify_url_2"
            },
            tracks: {
                href: "href",
                total: 0
            }
        },
        {
            id: "plist3Id",
            name: "plist3",
            external_urls: {
                spotify: "spotify_url_3"
            },
            tracks: {
                href: "href",
                total: 0
            }
        }
    ],
    error: null
};

describe("PlaylistList", () => {
    it("renders list of checkbox items and calls setCheckedList when checking a checkbox", () => {
        (useAuth as jest.Mock).mockReturnValue(useAuthResult);
        (usePlaylists as jest.Mock).mockReturnValue(successfulUsePlaylistResult);

        let checkedPlaylists = ["plist3Id"];
        let setCheckedList = jest.fn();

        render(
            <PlaylistList checkedPlaylists={checkedPlaylists} setCheckedList={setCheckedList}/>
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
    })

    it("renders list of checkbox items and calls setCheckedList when unchecking a checkbox", () => {
        (useAuth as jest.Mock).mockReturnValue(useAuthResult);
        (usePlaylists as jest.Mock).mockReturnValue(successfulUsePlaylistResult);

        let checkedPlaylists = ["plist3Id"];
        let setCheckedList = jest.fn();

        render(
            <PlaylistList checkedPlaylists={checkedPlaylists} setCheckedList={setCheckedList}/>
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
    })

    it("renders error when an error occurs while fetching playlists", () => {
        (useAuth as jest.Mock).mockReturnValue(useAuthResult);
        let usePlaylistsResult = {
            playlists: null,
            error: {
                status: 400,
                message: "An error occurred while fetching playlists"
            }
        };
        (usePlaylists as jest.Mock).mockReturnValue(usePlaylistsResult);

        let setCheckedList = jest.fn();

        render(
            <PlaylistList checkedPlaylists={[]} setCheckedList={setCheckedList}/>
        );

        expect(screen.getByText("Failed to load")).toBeInTheDocument();
        expect(logoutFunction).toHaveBeenCalledTimes(0);
    })

    it("renders error and performs logout when an error 401 occurs while fetching playlists", () => {
        (useAuth as jest.Mock).mockReturnValue(useAuthResult);
        let usePlaylistsResult = {
            playlists: null,
            error: {
                status: 401,
                message: "An error occurred while fetching playlists"
            }
        };
        (usePlaylists as jest.Mock).mockReturnValue(usePlaylistsResult);

        let setCheckedList = jest.fn();

        render(
            <PlaylistList checkedPlaylists={[]} setCheckedList={setCheckedList}/>
        );

        expect(screen.getByText("Failed to load")).toBeInTheDocument();
        expect(logoutFunction).toHaveBeenCalledTimes(1);
    })

    it("renders loading message when no playlists found", () => {
        (useAuth as jest.Mock).mockReturnValue(useAuthResult);
        let usePlaylistsResult = {
            playlists: null,
            error: null
        };
        (usePlaylists as jest.Mock).mockReturnValue(usePlaylistsResult);

        let setCheckedList = jest.fn();

        render(
            <PlaylistList checkedPlaylists={[]} setCheckedList={setCheckedList}/>
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    })
})