#import "Cheminot.h"
#import <Cordova/CDVPlugin.h>

@implementation Cheminot

-(const char*)dbPath {
    NSString* path = [[NSBundle mainBundle] pathForResource:@"cheminot" ofType:@"db"];
    return [path UTF8String];
}

- (void)init:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"pong"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end
