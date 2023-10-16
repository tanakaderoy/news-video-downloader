import * as FileSystem from 'expo-file-system'
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { FFmpegKit, FFprobeKit, ReturnCode } from 'ffmpeg-kit-react-native';

export default async (fileName?: string, uri?: string, callback?: (done: boolean) => void) => {
    if (!fileName || !uri) {
        return callback?.(true)

    }

    const perm = await MediaLibrary.requestPermissionsAsync()
    if (!perm.granted) return callback?.(true)


    const fileUri = `${FileSystem.documentDirectory}${fileName.replaceAll(' ', '')}`
    try {
    } catch (e) {

    }
    const command = `-i  ${uri} -c copy -bsf:a aac_adtstoasc ${fileUri}`;
    try {


        await FFmpegKit.executeAsync(command, async session => {
            const returnCode = await session.getReturnCode();

            if (ReturnCode.isSuccess(returnCode)) {
                // If download was successful, move the downloaded file into the devices library
                try {
                    console.log("File SuccessFull")
                    await MediaLibrary.saveToLibraryAsync(fileUri)
                    await FileSystem.deleteAsync(fileUri)
                    callback?.(true)
                } catch (e) {
                    console.error(e)
                    callback?.(true)
                }
            }
        })

    } catch (error) {
        console.error(error)
    }

}