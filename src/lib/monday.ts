import { MondayBoardResponse, MondayItem } from "./types";

const MONDAY_API_URL = "https://api.monday.com/v2";

export async function fetchMondayBoard(boardId: string): Promise<MondayItem[]> {
  const apiKey = process.env.MONDAY_API_KEY;
  if (!apiKey) throw new Error("MONDAY_API_KEY is not set");

  const query = `query {
    boards(ids: [${boardId}]) {
      id
      name
      items_page(limit: 500) {
        items {
          id
          name
          created_at
          updated_at
          column_values {
            id
            text
            value
            column {
              id
              title
              type
            }
          }
        }
        cursor
      }
    }
  }`;

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "API-Version": "2024-10",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Monday API error ${res.status}: ${text}`);
  }

  const data: MondayBoardResponse = await res.json();
  const board = data.boards?.[0];
  if (!board) throw new Error(`Board ${boardId} not found`);

  let allItems = board.items_page.items;
  let cursor = board.items_page.cursor;

  while (cursor) {
    const nextPage = await fetchNextPage(boardId, cursor);
    allItems = [...allItems, ...nextPage.items];
    cursor = nextPage.cursor;
  }

  return allItems;
}

async function fetchNextPage(
  boardId: string,
  cursor: string
): Promise<{ items: MondayItem[]; cursor: string | null }> {
  const apiKey = process.env.MONDAY_API_KEY!;

  const query = `query {
    next_items_page(cursor: "${cursor}", limit: 500) {
      items {
        id
        name
        created_at
        updated_at
        column_values {
          id
          text
          value
          column {
            id
            title
            type
          }
        }
      }
      cursor
    }
  }`;

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "API-Version": "2024-10",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Monday API pagination error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.data?.next_items_page ?? { items: [], cursor: null };
}
