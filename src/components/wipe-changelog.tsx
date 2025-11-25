"use client";

import { AlertCircle, CheckCircle2, Zap } from "lucide-react";

interface ChangelogProps {
  title?: string;
  summary?: string;
  features?: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    category?: string;
  }>;
  bugFixes?: string[];
  balanceChanges?: string[];
  sourceUrl?: string;
}

export function WipeChangelog({
  title,
  summary,
  features,
  bugFixes,
  balanceChanges,
  sourceUrl,
}: ChangelogProps) {
  if (!title && !summary && !features && !bugFixes && !balanceChanges) {
    return null;
  }

  return (
    <div className="space-y-6">
      {title && (
        <div>
          <h3 className="text-2xl font-bold text-zinc-100 mb-2">{title}</h3>
          {summary && (
            <p className="text-zinc-400 leading-relaxed">{summary}</p>
          )}
        </div>
      )}

      {/* Features */}
      {features && features.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-semibold text-zinc-100">New Features</h4>
          </div>

          <div className="space-y-3">
            {features.map((feature, i) => (
              <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4">
                <div className="flex gap-3">
                  {feature.imageUrl && (
                    <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-zinc-700">
                      <img
                        src={feature.imageUrl}
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h5 className="font-semibold text-zinc-100">
                      {feature.title}
                    </h5>
                    {feature.category && (
                      <p className="text-xs text-zinc-500 mb-1">
                        {feature.category}
                      </p>
                    )}
                    <p className="text-sm text-zinc-400">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bug Fixes */}
      {bugFixes && bugFixes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-semibold text-zinc-100">Bug Fixes</h4>
          </div>

          <ul className="space-y-2">
            {bugFixes.slice(0, 5).map((fix, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-zinc-300 bg-zinc-800/30 border border-zinc-700/30 rounded px-3 py-2"
              >
                <span className="text-blue-400 flex-shrink-0">✓</span>
                <span>{fix}</span>
              </li>
            ))}
            {bugFixes.length > 5 && (
              <p className="text-xs text-zinc-500 px-3 py-2">
                +{bugFixes.length - 5} more fixes
              </p>
            )}
          </ul>
        </div>
      )}

      {/* Balance Changes */}
      {balanceChanges && balanceChanges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <h4 className="text-lg font-semibold text-zinc-100">Balance Changes</h4>
          </div>

          <ul className="space-y-2">
            {balanceChanges.slice(0, 5).map((change, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-zinc-300 bg-zinc-800/30 border border-zinc-700/30 rounded px-3 py-2"
              >
                <span className="text-yellow-400 flex-shrink-0">⚡</span>
                <span>{change}</span>
              </li>
            ))}
            {balanceChanges.length > 5 && (
              <p className="text-xs text-zinc-500 px-3 py-2">
                +{balanceChanges.length - 5} more changes
              </p>
            )}
          </ul>
        </div>
      )}

      {sourceUrl && (
        <div className="pt-3 border-t border-zinc-700/50">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            View full patch notes →
          </a>
        </div>
      )}
    </div>
  );
}
