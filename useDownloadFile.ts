import * as FileSystem from 'expo-file-system'
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';

export default async (fileName?: string, uri?: string, callback?:FileSystem.DownloadProgressCallback) => {
if(!fileName || !uri){
    return
}
    const perm = await Permissions.askAsync(Permissions.MEDIA_LIBRARY)
    if(perm.status != 'granted'){
        return
    }


const fileUri = `${FileSystem.documentDirectory}${fileName}`

const downloadResumable = FileSystem.createDownloadResumable(uri, fileUri,{},callback)
const downloadedFile = await downloadResumable.downloadAsync()
if(downloadedFile){
try {
    const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri)
    const album = await MediaLibrary.getAlbumAsync('Download')
    if (album == null) {
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
} catch (e) {
    
}
}



}