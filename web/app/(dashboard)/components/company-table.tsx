"use client";

import React from "react";

type Company = {
  name: string;
  sector: string;
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
  overall_score?: number;
  grade?: string;
};

export default function CompanyTable({ companies, onSelect }: { companies: Company[]; onSelect?: (c: Company) => void }) {
  return (
    <div className="table-wrap">
      <table className="company-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Company</th>
            <th>Sector</th>
            <th>Env</th>
            <th>Social</th>
            <th>Gov</th>
            <th>Overall</th>
            <th>Grade</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c, i) => (
            <tr key={c.name}>
              <td className="rank">{i + 1}</td>
              <td className="company-name">{c.name}</td>
              <td className="sector">{c.sector}</td>
              <td>{c.environmental_score ?? "—"}</td>
              <td>{c.social_score ?? "—"}</td>
              <td>{c.governance_score ?? "—"}</td>
              <td>{c.overall_score ?? "—"}</td>
              <td><span className="grade-badge">{c.grade ?? "—"}</span></td>
              <td>
                <button className="action-btn" onClick={() => onSelect && onSelect(c)}>Recommendations</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
