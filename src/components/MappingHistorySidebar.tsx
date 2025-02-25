
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Clock, FileText, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MappingHistoryVersion } from '@/types/mapping-history';
import { Mapping } from '@/types/mapping';
import { UI_CONFIG } from '@/config/constants';

interface MappingHistorySidebarProps {
  versions: MappingHistoryVersion[];
  selectedVersion: MappingHistoryVersion | null;
  onSelectVersion: (version: MappingHistoryVersion) => void;
  loading: boolean;
  currentMapping: Mapping | null;
}

const MappingHistorySidebar: React.FC<MappingHistorySidebarProps> = ({
  versions,
  selectedVersion,
  onSelectVersion,
  loading,
  currentMapping,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), UI_CONFIG.DATE_TIME_FORMAT);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          Version History
        </h2>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : versions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <FileText className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            No version history available
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="py-2">
            {/* Current version */}
            {currentMapping && (
              <div className="px-4 py-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">Current Version</div>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left py-2 h-auto`}
                  disabled
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm truncate w-full">{currentMapping.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(currentMapping.updated_at)}
                    </span>
                  </div>
                </Button>
                <Separator className="my-2" />
              </div>
            )}
            
            {/* Previous versions */}
            <div className="px-4 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">Previous Versions</div>
              {versions.map((version) => (
                <Button
                  key={version.txnid}
                  variant="ghost"
                  className={`w-full justify-start text-left py-2 h-auto mb-1 ${
                    selectedVersion?.txnid === version.txnid
                      ? 'bg-accent text-accent-foreground'
                      : ''
                  }`}
                  onClick={() => onSelectVersion(version)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm truncate w-full">{version.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(version.updated_at)}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.isArray(version.content.tags) && version.content.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {Array.isArray(version.content.tags) && version.content.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{version.content.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default MappingHistorySidebar;
