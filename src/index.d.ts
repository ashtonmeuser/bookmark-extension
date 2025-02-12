type Bookmark = {
  id: string;
  title: string;
  url: string;
};

type BookmarkNode = Bookmark & { node: HTMLElement };

type Navigation = {
  url: string;
  target: '_self' | '_blank' | '_top';
};
