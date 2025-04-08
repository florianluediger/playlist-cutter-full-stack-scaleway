import { fireEvent, render, screen } from "@testing-library/react";
import { PlaylistListItem } from "./PlaylistListItem";

it("calls onChange method with correct parameters when checkbox is checked", () => {
  let plist = {
    id: "playlistId",
    name: "playlistName",
    external_urls: {
      spotify: "url",
    },
    tracks: {
      href: "href",
      total: 0,
    },
  };
  let onChange = jest.fn();
  render(<PlaylistListItem playlist={plist} onChange={onChange} />);
  expect(screen.getByText("playlistName")).toBeInTheDocument();
  let checkbox: HTMLInputElement = screen.getByRole("checkbox");
  expect(checkbox).toBeInTheDocument();
  expect(checkbox.checked).toEqual(false);
  fireEvent.click(checkbox);
  expect(checkbox.checked).toEqual(true);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith("playlistId", true);
});
