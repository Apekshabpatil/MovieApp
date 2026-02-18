const STORAGE_KEY = "netflix_my_list";

function getList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveList(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getMyList() {
  return getList();
}

export function addToMyList(item) {
  const list = getList();
  if (list.some((i) => i.id === item.id && (i.media_type || "movie") === (item.media_type || "movie"))) return list;
  list.push({ ...item, media_type: item.media_type || "movie" });
  saveList(list);
  return list;
}

export function removeFromMyList(item) {
  const list = getList().filter(
    (i) => !(i.id === item.id && (i.media_type || "movie") === (item.media_type || "movie"))
  );
  saveList(list);
  return list;
}

export function isInMyList(item) {
  return getList().some(
    (i) => i.id === item.id && (i.media_type || "movie") === (item.media_type || "movie")
  );
}
