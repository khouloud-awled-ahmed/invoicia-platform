import { Model } from 'mongoose';
import { PlatformSettings, PlatformSettingsDocument } from './schemas/platform-settings.schema';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
export declare class PlatformSettingsService {
    private settingsModel;
    constructor(settingsModel: Model<PlatformSettingsDocument>);
    getSettings(): Promise<PlatformSettings>;
    updateSettings(updateDto: UpdatePlatformSettingsDto): Promise<PlatformSettings>;
}
