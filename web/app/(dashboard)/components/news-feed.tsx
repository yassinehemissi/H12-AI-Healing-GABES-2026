"use client";

import React from "react";

type NewsItem = { title: string; url: string; published?: string };

export default function NewsFeed({ items }: { items: NewsItem[] }) {
  return (
    <div className="news-grid">
      {items.map((item, i) => (
        <a key={i} href={item.url} target="_blank" rel="noreferrer" className="news-card">
          <div className="news-date">{item.published}</div>
          <h3 className="news-title">{item.title}</h3>
          <span className="news-link">Read more →</span>
        </a>
      ))}
    </div>
  );
}
