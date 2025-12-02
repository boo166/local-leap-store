import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, GitCompare, Trash2 } from 'lucide-react';
import { CompareProduct } from '@/hooks/useProductComparison';

interface CompareBarProps {
  products: CompareProduct[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  maxItems: number;
}

const CompareBar: React.FC<CompareBarProps> = ({ products, onRemove, onClear, maxItems }) => {
  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <span className="font-medium">
              Compare ({products.length}/{maxItems})
            </span>
          </div>

          <div className="flex-1 flex items-center gap-3 overflow-x-auto py-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border group"
              >
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onRemove(product.id)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5">
                  <p className="text-[10px] text-white truncate">{product.name}</p>
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: maxItems - products.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
              >
                <span className="text-xs text-muted-foreground">+</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Link to="/compare">
              <Button variant="apple" size="sm" disabled={products.length < 2}>
                <GitCompare className="h-4 w-4 mr-2" />
                Compare {products.length >= 2 ? `(${products.length})` : ''}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
