import { LayoutGrid, Check } from 'lucide-react';
import { PhotoTemplate } from '../../types';

interface TemplateSelectorProps {
  templates: PhotoTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: PhotoTemplate) => void;
}

export default function TemplateSelector({
  templates,
  selectedTemplateId,
  onSelectTemplate,
}: TemplateSelectorProps) {
  if (templates.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Templates</h3>
        </div>

        <div className="text-center py-8">
          <p className="text-slate-400">No templates available for this theme</p>
        </div>
      </div>
    );
  }

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, PhotoTemplate[]>);

  const categoryLabels: Record<string, string> = {
    single: 'Single Portrait',
    collage: 'Collages',
    grid: 'Grid Layouts',
    story: 'Story Layouts',
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <LayoutGrid className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">Album Templates</h3>
      </div>

      {/* Templates by Category */}
      <div className="space-y-6">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category}>
            <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
              {categoryLabels[category] || category}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {categoryTemplates.map((template) => (
                <TemplateCard
                  key={template.template_id}
                  template={template}
                  isSelected={template.template_id === selectedTemplateId}
                  onSelect={() => onSelectTemplate(template)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">
          Select a template to arrange your photos in a professional layout
        </p>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: PhotoTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative group rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-500/30'
          : 'border border-slate-700 hover:border-violet-500/50'
      }`}
    >
      {/* Template Preview */}
      <div className="aspect-[3/4] bg-slate-800 relative overflow-hidden">
        {/* Preview visualization based on layout */}
        <TemplatePreview template={template} />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-3 bg-slate-800/50">
        <p className="text-sm font-bold text-slate-200 truncate">
          {template.name}
        </p>
        <p className="text-xs text-slate-500">
          {template.layout.imageSlots.length} photo
          {template.layout.imageSlots.length !== 1 ? 's' : ''}
        </p>
      </div>
    </button>
  );
}

interface TemplatePreviewProps {
  template: PhotoTemplate;
}

function TemplatePreview({ template }: TemplatePreviewProps) {
  const { layout } = template;

  return (
    <div
      className="absolute inset-0"
      style={{
        background: layout.background?.gradient || layout.background?.color || '#1a1a1a',
      }}
    >
      {/* Render image slots as placeholders */}
      {layout.imageSlots.map((slot, index) => (
        <div
          key={slot.id}
          className="absolute bg-slate-700 border border-slate-600"
          style={{
            left: `${slot.x}%`,
            top: `${slot.y}%`,
            width: `${slot.width}%`,
            height: `${slot.height}%`,
            transform: `rotate(${slot.rotation || 0}deg)`,
            borderRadius: `${slot.borderRadius || 0}px`,
            zIndex: slot.zIndex || 1,
          }}
        >
          {/* Slot number indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-500 text-xs font-bold">{index + 1}</span>
          </div>
        </div>
      ))}

      {/* Render text slots if any */}
      {layout.textSlots.map((textSlot) => (
        <div
          key={textSlot.id}
          className="absolute bg-slate-600/30 border border-dashed border-slate-500"
          style={{
            left: `${textSlot.x}%`,
            top: `${textSlot.y}%`,
            width: `${textSlot.width}%`,
            height: '8%',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-500 text-[8px]">Text</span>
          </div>
        </div>
      ))}

      {/* Render decorative elements if any */}
      {layout.decorativeElements.map((element) => (
        <div
          key={element.id}
          className="absolute w-4 h-4 bg-slate-600 rounded-full opacity-50"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
        />
      ))}
    </div>
  );
}
