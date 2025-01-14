import { CommandBarButton, ContextualMenu, DefaultButton, Dialog, DialogFooter, DialogType, ICommandBarStyles, IContextualMenuItem, IStackStyles, PrimaryButton, Spinner, SpinnerSize, Stack, StackItem, Text } from "@fluentui/react";
import { useBoolean } from '@fluentui/react-hooks';

import styles from "./ChatHistoryPanel.module.css"
import { useContext, useEffect } from "react";
import { AppStateContext } from "../../state/AppProvider";
import React from "react";
import ChatHistoryList from "./ChatHistoryList";
import { ChatHistoryLoadingState, historyDeleteAll } from "../../api";

import Close from "../../assets/uta-close.svg";
import UTA_OPTIONS from "../../assets/uta-options.svg";

interface ChatHistoryPanelProps {
    newChat: () => void;

}

export enum ChatHistoryPanelTabs {
    History = "History"
}

const commandBarStyle: ICommandBarStyles = {
    root: {
        padding: '0',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
};

const commandBarButtonStyle: Partial<IStackStyles> = { root: { height: '50px' } };

export function ChatHistoryPanel(props: ChatHistoryPanelProps) {
    const appStateContext = useContext(AppStateContext)
    const [showContextualMenu, setShowContextualMenu] = React.useState(false);
    const [hideClearAllDialog, { toggle: toggleClearAllDialog }] = useBoolean(true);
    const [clearing, setClearing] = React.useState(false)
    const [clearingError, setClearingError] = React.useState(false)

    const clearAllDialogContentProps = {
        type: DialogType.close,
        title: !clearingError? 'Are you sure you want to clear all chat history?' : 'Error deleting all of chat history',
        closeButtonAriaLabel: 'Close',
        subText: !clearingError ? 'All chat history will be permanently removed.' : 'Please try again. If the problem persists, please contact the site administrator.',
    };
    
    const modalProps = {
        titleAriaId: 'labelId',
        subtitleAriaId: 'subTextId',
        isBlocking: true,
        styles: { main: { maxWidth: 450 } },
    }

    const menuItems: IContextualMenuItem[] = [
        { key: 'clearAll', text: 'Clear all chat history', iconProps: { iconName: 'Delete' }},
    ];

    const handleHistoryClick = () => {
        appStateContext?.dispatch({ type: 'TOGGLE_CHAT_HISTORY' })
    };
    
    const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault(); // don't navigate
        setShowContextualMenu(true);
    }, []);

    const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), []);

    const onClearAllChatHistory = async () => {
        setClearing(true)
        let response = await historyDeleteAll()
        if(!response.ok){
            setClearingError(true)
        }else{
            appStateContext?.dispatch({ type: 'DELETE_CHAT_HISTORY' })
            toggleClearAllDialog();
        }
        setClearing(false);
    }

    const onHideClearAllDialog = () => {
        toggleClearAllDialog()
        setTimeout(() => {
            setClearingError(false)
        }, 2000);
    }

    React.useEffect(() => {}, [appStateContext?.state.chatHistory, clearingError]);
    let userName = appStateContext?.state?.currentUser ? appStateContext?.state?.currentUser?.user_id : 'Hello There';
    useEffect(() => {
    console.info('context effect has run', appStateContext?.state?.currentUser)
        userName = appStateContext?.state?.currentUser ? appStateContext?.state?.currentUser?.user_id : 'Hello There';
    }, [appStateContext?.state?.currentUser])

    

    console.info('appStateContext ', appStateContext)
    return (
        <section className={styles.container} data-is-scrollable aria-label={"chat history panel"}>
            <Stack horizontal horizontalAlign='space-evenly' verticalAlign='center' wrap aria-label="chat history header">
                <Stack horizontal className="mb-3">
                    <button 
                        className={`bg-off-white text-off-black font-bold py-1 px-5 rounded-lg ${styles.bold}`}
                        onClick={props.newChat}
                        >New Chat</button>
                    <button 
                        className={`bg-transparent hover:bg-blue-700 text-off-white py-2 px-5 rounded-lg ${styles.bold}`}
                        onClick={toggleClearAllDialog}
                        >Clear History</button>
                    
                    <div className={styles.closeIcon}
                            onClick={handleHistoryClick}
                        >
                            <img
                                    src={Close}
                                    // className={styles.chatIcon}
                                    aria-hidden="true"
                                />
                        </div>

                </Stack>
                <Stack verticalAlign="start">
                    {/* <Stack horizontal styles={commandBarButtonStyle}>
                        <CommandBarButton
                            iconProps={{ iconName: 'More' }}
                            title={"Clear all chat history"}
                            onClick={onShowContextualMenu}
                            aria-label={"clear all chat history"}
                            styles={commandBarStyle}
                            role="button"
                            id="moreButton"
                        />
                        <ContextualMenu
                            items={menuItems}
                            hidden={!showContextualMenu}
                            target={"#moreButton"}
                            onItemClick={toggleClearAllDialog}
                            onDismiss={onHideContextualMenu}
                        />
                        <CommandBarButton
                            iconProps={{ iconName: 'Cancel' }}
                            title={"Hide"}
                            onClick={handleHistoryClick}
                            aria-label={"hide button"}
                            styles={commandBarStyle}
                            role="button"
                        />
                    </Stack> */}
                </Stack>
            </Stack>
            <Stack aria-label="chat history panel content"
                styles={{
                    root: {
                        display: "flex",
                        flexGrow: 1,
                        flexDirection: "column",
                        paddingTop: '2.5px',
                        maxWidth: "100%"
                    },
                }}
                style={{
                    display: "flex",
                    flexGrow: 1,
                    flexDirection: "column",
                    flexWrap: "wrap",
                    padding: "1px"
                }}>
                <Stack className={styles.chatHistoryListContainer}>
                    {(appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Success && appStateContext?.state.isCosmosDBAvailable.cosmosDB) && <ChatHistoryList/>}
                    {(appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Fail && appStateContext?.state.isCosmosDBAvailable) && <>
                        <Stack>
                            <Stack horizontalAlign='center' verticalAlign='center' style={{ width: "100%", marginTop: 10 }}>
                                <StackItem>
                                    <Text style={{ alignSelf: 'center', fontWeight: '400', fontSize: 16, color: '#DBD8C7'}}>
                                        {appStateContext?.state.isCosmosDBAvailable?.status && <span>{appStateContext?.state.isCosmosDBAvailable?.status}</span>}
                                        {!appStateContext?.state.isCosmosDBAvailable?.status && <span>Error loading chat history</span>}
                                        
                                    </Text>
                                </StackItem>
                                <StackItem>
                                    <Text style={{ alignSelf: 'center', fontWeight: '400', fontSize: 14, color: '#DBD8C7' }}>
                                        <span>Chat history can't be saved at this time</span>
                                    </Text>
                                </StackItem>
                            </Stack>
                        </Stack>
                    </>}
                    {appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Loading && <>
                        <Stack>
                            <Stack horizontal horizontalAlign='center' verticalAlign='center' style={{ width: "100%", marginTop: 10 }}>
                                <StackItem style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Spinner style={{ alignSelf: "flex-start", height: "100%", marginRight: "5px", color: '#DBD8C7' }} size={SpinnerSize.medium} />
                                </StackItem>
                                <StackItem>
                                    <Text style={{ alignSelf: 'center', fontWeight: '400', fontSize: 14, color: '#DBD8C7' }}>
                                        <span style={{ whiteSpace: 'pre-wrap' }}>Loading chat history</span>
                                    </Text>
                                </StackItem>
                            </Stack>
                        </Stack>
                    </>}
                </Stack>
                
            </Stack>
            <div className={styles.user}>
                <div className={styles.userDetails}>
                    <div className={styles.userPhoto}></div>
                    <div className={styles.userName}>{userName}</div>
                </div>
                
                <div className={styles.userMenu} onClick={handleHistoryClick}>
                    <img src={UTA_OPTIONS}
                        aria-hidden="true"
                        /> 
                </div>
            </div>
            <Dialog
                hidden={hideClearAllDialog}
                onDismiss={clearing ? ()=>{} : onHideClearAllDialog}
                dialogContentProps={clearAllDialogContentProps}
                modalProps={modalProps}
            >
                <DialogFooter>
                {!clearingError && <PrimaryButton onClick={onClearAllChatHistory} disabled={clearing} text="Clear All" />}
                <DefaultButton onClick={onHideClearAllDialog} disabled={clearing} text={!clearingError ? "Cancel" : "Close"} />
                </DialogFooter>
            </Dialog>
        </section>
    );
}