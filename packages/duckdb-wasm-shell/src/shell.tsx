import * as model from './model';
import * as shell from '../crate/pkg';
import FileExplorer from './components/file_explorer';
import Overlay from './components/overlay';
import React from 'react';
import { FileRejection, DropEvent } from 'react-dropzone';
import { connect } from 'react-redux';

import styles from './shell.module.css';
import 'xterm/css/xterm.css';

const duckdbWorker = new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-async.worker.js', import.meta.url);
import * as duckdb from '@duckdb/duckdb-wasm/dist/duckdb.module.js';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb.wasm';
import { AsyncDuckDB } from '@duckdb/duckdb-wasm/dist/duckdb.module.js';

interface Props {
    workerURL?: string;

    backgroundColor?: string;
    padding?: number[];
    borderRadius?: number[];
    overlay: model.OverlayContent | null;

    openFileViewer: () => void;
    registerFiles: (files: model.FileInfo[]) => void;
}

class ShellRuntime {
    public _openFileExplorer: (() => void) | null = null;

    public openFileExplorer(this: ShellRuntime): void {
        if (this._openFileExplorer) {
            this._openFileExplorer();
        } else {
            shell.resumeAfterInput(shell.ShellInputContext.FileInput);
        }
    }
}

class Shell extends React.Component<Props> {
    /// The terminal container
    protected termContainer: React.RefObject<HTMLDivElement>;
    /// The runtime
    protected runtime: ShellRuntime;
    /// The database
    protected database: AsyncDuckDB | null;
    /// The drop file handler
    protected dropFileHandler = this.dropFiles.bind(this);

    /// Constructor
    constructor(props: Props) {
        super(props);
        this.termContainer = React.createRef();
        this.runtime = new ShellRuntime();
        this.database = null;
    }

    /// Drop files
    public async dropFiles(acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) {
        if (!this.database) return;
        for (const file of acceptedFiles) {
            await this.database.addFileBlob(file.name, file);
        }
        const fileInfos = acceptedFiles.map(f => ({
            name: f.name,
            url: `file://${f.name}`,
            size: 0,
            downloadProgress: 1.0,
        }));
        console.log(fileInfos.toString());
        this.props.registerFiles(fileInfos);
    }

    /// Render the demo
    public render(): React.ReactElement {
        const style: React.CSSProperties = {
            padding: this.props.padding ? `${this.props.padding.map(p => `${p}px`).join(' ')}` : '0px',
            borderRadius: this.props.borderRadius ? `${this.props.borderRadius.map(p => `${p}px`).join(' ')}` : '0px',
            backgroundColor: this.props.backgroundColor || 'transparent',
        };
        return (
            <div className={styles.root} style={style}>
                <div ref={this.termContainer} className={styles.term_container}></div>
                {this.props.overlay === model.OverlayContent.FILE_EXPLORER && (
                    <Overlay>
                        <FileExplorer database={this.database} onDrop={this.dropFileHandler} />
                    </Overlay>
                )}
            </div>
        );
    }

    public componentDidMount(): void {
        if (this.termContainer.current != null) {
            this.runtime._openFileExplorer = this.props.openFileViewer;
            shell.embed(this.termContainer.current, this.runtime, {
                backgroundColor: '#333',
            });

            // Open database
            const logger = new duckdb.ConsoleLogger();
            const worker = new Worker(duckdbWorker);
            this.database = new duckdb.AsyncDuckDB(logger, worker);
            this.database.open(duckdb_wasm).then(_ => shell.configureDatabase(this.database));
        }
    }

    public componentWillUnmount(): void {}
}

const mapStateToProps = (state: model.AppState) => ({
    overlay: state.overlay,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    openFileViewer: () =>
        dispatch({
            type: model.StateMutationType.OVERLAY_OPEN,
            data: model.OverlayContent.FILE_EXPLORER,
        }),
    registerFiles: (files: model.FileInfo[]) =>
        dispatch({
            type: model.StateMutationType.REGISTER_FILES,
            data: files,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Shell);
