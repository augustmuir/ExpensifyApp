import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {
    Clipboard, LinkCopy, Mail, Pencil, Trashcan,
} from '../../../components/Icon/Expensicons';
import getReportActionContextMenuStyles from '../../../styles/getReportActionContextMenuStyles';
import ReportActionContextMenuItem from './ReportActionContextMenuItem';

const propTypes = {
    // The ID of the report this report action is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.number.isRequired,

    // The ID of the report action this context menu is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
    reportActionID: PropTypes.number.isRequired,

    // If true, this component will be a small, row-oriented menu that displays icons but not text.
    // If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row.
    isMini: PropTypes.bool,

    // Controls the visibility of this component.
    isVisible: PropTypes.bool,

    // Function to trigger when we try to mark a message as unread
    onMarkAsUnread: PropTypes.func,
};

const defaultProps = {
    isMini: false,
    isVisible: false,
    onMarkAsUnread: () => {},
};

const ReportActionContextMenu = (props) => {
    /**
     * A list of all the context actions in this menu.
     */
    const CONTEXT_ACTIONS = [
        // Copy to clipboard
        {
            text: 'Copy to Clipboard',
            icon: Clipboard,
            onPress: () => {},
        },

        // Copy chat link
        {
            text: 'Copy Link',
            icon: LinkCopy,
            onPress: () => {},
        },

        // Mark as Unread
        {
            text: 'Mark as Unread',
            icon: Mail,
            onPress: props.onMarkAsUnread,
        },

        // Edit Comment
        {
            text: 'Edit Comment',
            icon: Pencil,
            onPress: () => {},
        },

        // Delete Comment
        {
            text: 'Delete Comment',
            icon: Trashcan,
            onPress: () => {},
        },
    ];
    const wrapperStyle = getReportActionContextMenuStyles(props.isMini);
    return props.isVisible && (
        <View style={wrapperStyle}>
            {CONTEXT_ACTIONS.map(contextAction => (
                <ReportActionContextMenuItem
                    icon={contextAction.icon}
                    text={contextAction.text}
                    isMini={props.isMini}
                    key={contextAction.text}
                    onPress={contextAction.onPress}
                />
            ))}
        </View>
    );
};

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default ReportActionContextMenu;
