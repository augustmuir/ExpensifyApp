import {Portal} from '@gorhom/portal';
import React, { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import type {AutoCompleteSuggestionsProps} from './types';

function AutoCompleteSuggestions<TSuggestion>({measureParentContainer, ...props}: AutoCompleteSuggestionsProps<TSuggestion>) {
    
    useEffect(() => {
        // Listen for the tap gesture event from ReportActionsList.js
        const subscription = DeviceEventEmitter.addListener('InvertedFlatListTapDetected', () => {
            props.onClose?.();
        });

        return () => { subscription.remove(); };
    }, [props]);

    return (
        <Portal hostName="suggestions">
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <BaseAutoCompleteSuggestions<TSuggestion> {...props} />
        </Portal>
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
