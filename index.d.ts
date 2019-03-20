export interface Serializer<T> {
	/**
	 * Serialize an object to binary sequence.
	 * @param obj The object to be serialized.
	 */
	serialize(obj: T): ArrayBuffer;

	/**
	 * Deserialize an object.
	 * @param source The array buffer that contains bytes to deserialize.
	 */
	deserialize(source: ArrayBuffer): T;
}

export interface CancellationToken {
	readonly isCancellationRequested: boolean;
	addCancelListener(cb: Function): void;
	removeCancelListener(cb: Function): void;
	throwIfCancellationRequested(): void;
}

export interface Configuration {
	getBoolean(key: string, defaultValue?: boolean): boolean;
	getConfiguration(configurationNamespace: string): Configuration;
	getEnabled(key: string, defaultValue?: boolean): boolean;
	getFloat(key: string, defaultValue?: number): number;
	getInt(key: string, defaultValue?: number): number;
	getObject<T>(key: string, defaultValue?: T): T;
	getString(key: string, defaultValue?: string): string;
}

export interface Disposable {
	dispose(): Task;
}

export interface Initable extends Disposable {
	init(): Task;
}

export interface Factory<T> {
	create(cancellationToken?: CancellationToken): Task<T>;
}

export interface FactorySync<T> {
	createSync(): T;
}

/**
 * Represent financial amount type.
 * The value is presented as stringified integer value with number of fraction digits.
 * The type doesn't have any limit to digits count and doesn't vulnerable rounding precision.
 * @example 
 * const moneyAmount: FinancialLike = ...
 * const amount: number = parseInt(moneyAmount.value) / (10 ^ moneyAmount.fraction)
 */
export interface Financial {
	readonly value: string;
	readonly fraction: number;
}

export interface Logger {
	readonly isTraceEnabled: boolean;
	readonly isDebugEnabled: boolean;
	readonly isInfoEnabled: boolean;
	readonly isWarnEnabled: boolean;
	readonly isErrorEnabled: boolean;
	readonly isFatalEnabled: boolean;

	trace(message: string, ...args: any[]): void;
	debug(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
	fatal(message: string, ...args: any[]): void;
}

// export interface StreamSerializerLike<T> {
// 	/**
// 	 * Serialization is the process of representing an object to binary sequence.
// 	 * @param obj The object to be serialized.
// 	 * @param target The target IStream for write binary representation.
// 	 * @throws {Error("Invalid operation")} An error occurred during serialization. The original exception is available using the innerException property.
// 	 */
// 	serializeToStream(obj: T, target: io.StreamLike): Promise<void>;

// 	/**
// 	 * Deserialization is the process of reading bytes from IStream
// 	 * and constructing an object.
// 	 * @param source The IStream that contains bytes to deserialize.
// 	 * @throws {Error("Invalid operation")} An error occurred during serialization. The original exception is available using the innerException property.
// 	 */
// 	deserializeFromStream(source: io.StreamLike): Promise<T>;
// }

export interface Task<T = void> extends Promise<T> {
	readonly error: Error;
	readonly result: T;

	/**
	 * Returns true if any of isSuccessed, isFaulted, isCancelled returns true
	 */
	readonly isCompleted: boolean;

	/**
	 * Task completed succesfully. You can read result value.
	 */
	readonly isSuccessed: boolean;

	/**
	 * Task completed with error. You can read error value.
	 */
	readonly isFaulted: boolean;

	/**
	 * Task completed with error. You cannot read nor result nor error value.
	 */
	readonly isCancelled: boolean;

	/**
	 * Attaches callbacks for the resolution and/or rejection of the Promise.
	 * @param onfulfilled The callback to execute when the Promise is resolved.
	 * @param onrejected The callback to execute when the Promise is rejected.
	 * @returns A Promise for the completion of which ever callback is executed.
	 */
	then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: Error) => TResult2 | PromiseLike<TResult2>) | undefined | null): Task<TResult1 | TResult2>;

	/**
	 * Attaches a callback for only the rejection of the Promise.
	 * @param onrejected The callback to execute when the Promise is rejected.
	 * @returns A Promise for the completion of the callback.
	 */
	catch<TResult = never>(onrejected?: ((reason: Error) => TResult | PromiseLike<TResult>) | undefined | null): Task<T | TResult>;
}

// export declare namespace collections {
// 	export interface EnumeratorLike<T> {
// 		reset(): void | Promise<void>;
// 		moveNext(): boolean | Promise<boolean>;
// 		getCurrent(): T | Promise<T>;
// 	}
// 	export interface EnumerableLike<T> {
// 		enumerator(): EnumeratorLike<T> | Promise<EnumeratorLike<T>>;
// 	}
// }

/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
export interface Publisher<TProtocol> extends Disposable {
	send(data: TProtocol, cancellationToken?: CancellationToken): Task<void>;
}

/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
export interface Subscriber<TProtocol> extends Disposable {
	/** The callback function reference.
	 * You can set null to the property to temporary disable notification.
	 * @param data Repesent data from a subscriber's backend or Error if the subscriber crashes.
	 * Note: after receive data as Error the subscriber destroyed and never call callback again.
	 */
	cb: ((data: TProtocol | Error) => void | Promise<void>) | null;
}

/** Define some kind of a transport for RPC implementations */
export interface InvokeTransport<TIn, TOut> extends Disposable {
	invoke(args: TIn, cancellationToken?: CancellationToken): Task<TOut>;
}

//export interface StreamTransportLike<TMetadata> extends DisposableLike {
//	stream(data: TMetadata, cancellationToken?: CancellationTokenLike): Promise<io.StreamLike>;
//}

// export declare namespace data {

// 	export namespace sql {
// 		export type SqlStatementParam = boolean | string | number | Date | Uint8Array
// 			| Array<string> | Array<number> | Array<Date> | Array<Uint8Array> | FinancialLike;

// 		// const enum SqlType {
// 		// 	BINARY,
// 		// 	BOOL,
// 		// 	DOUBLE,
// 		// 	INT8,
// 		// 	INT16,
// 		// 	INT32,
// 		// 	INT64,
// 		// 	UINT8,
// 		// 	UINT16,
// 		// 	UINT32,
// 		// 	UINT64
// 		// }

// 		export interface SqlValue {
// 			readonly asBoolean: boolean;
// 			readonly asNullableBoolean: boolean | null;
// 			readonly asString: string;
// 			readonly asNullableString: string | null;
// 			readonly asNumber: number;
// 			readonly asNullableNumber: number | null;
// 			readonly asFinancial: FinancialLike;
// 			readonly asNullableFinancial: FinancialLike | null;
// 			readonly asDate: Date;
// 			readonly asNullableDate: Date | null;
// 			readonly asBinary: Uint8Array;
// 			readonly asNullableBinary: Uint8Array | null;
// 		}

// 		export interface SqlProvider extends DisposableLike {
// 			statement(sql: string): SqlStatement;
// 		}

// 		export interface SqlProviderFactory extends Factory<SqlProvider> { }

// 		export interface SqlRow {
// 			[name: string]: SqlValue;
// 		}

// 		export interface SqlSet extends collections.EnumeratorLike<SqlRow>, DisposableLike {
// 		}

// 		export interface SqlStatement {
// 			param(value: SqlStatementParam): this;
// 			execute(): Promise<void>;
// 			executeTop(): Promise<SqlRow>;
// 			executeQuery(): Promise<SqlSet>;
// 			executeScalar(): Promise<SqlValue>;
// 		}
// 	}
// }

// export declare namespace io {
// 	export const enum SeekOrigin {
// 		Begin = -1,
// 		Current = 0,
// 		End = 1,
// 	}
// 	export interface StreamLike extends DisposableLike {
// 		/**
// 		 * Gets a value indicating whether the current stream supports reading.
// 		 */
// 		readonly isReadable: boolean;
// 		/**
// 		 * Gets a value indicating whether the current stream supports seeking.
// 		 */
// 		readonly isSeekable: boolean;
// 		/**
// 		 * Gets a value indicating whether the current stream supports writing.
// 		 */
// 		readonly isWriteable: boolean;
// 		/**
// 		 * Gets the position within the current stream.
// 		 */
// 		readonly position: number;
// 		/**
// 		 * Reads the bytes from the current stream and writes them to another stream.
// 		 * @param destination The stream to which the contents of the current stream will be copied.
// 		 * @throws {Error("Argument error")} destination is null or undefined.
// 		 * @throws {Error("I/O error")} An I/O error occurs.
// 		 * @throws {Error("Invalid operation")} The stream does not support seeking, such as if the stream is constructed from a pipe or console output.
// 		 * @throws {Error("Object disposed")} Methods were called after the stream was disposed(closed).
// 		 */
// 		copyTo(destination: StreamLike): Promise<void>;
// 		/**
// 		 * Reads a sequence of bytes from the current stream and advances the position
// 		 * within the stream by the number of bytes read.
// 		 * @param buf An array of bytes. When this method returns,
// 		 * the buffer contains the specified byte array with the values between offset
// 		 * and (offset + count - 1) replaced by the bytes read from the current source.
// 		 * @param  The zero-based byte offset in buffer at which to begin storing the data read from the current stream.
// 		 * @returns The total number of bytes read into the buffer. This can be less than the number of bytes requested
// 		 * if that many bytes are not currently available, or zero (0) if the end of the stream has been reached.
// 		 * @throws {Error("I/O error")} An I/O error occurs.
// 		 * @throws {Error("Invalid operation")} The stream does not support reading, such as if the stream is constructed from a console output.
// 		 * @throws {Error("Object disposed")} Methods were called after the stream was disposed(closed).
// 		 */
// 		read(buf: ArrayBuffer, offset?: number, count?: number): Promise<number>;
// 		/**
// 		 * Sets the position within the current stream.
// 		 * @param offset A byte offset relative to the origin parameter.
// 		 * @param origin A value of type SeekOrigin indicating the reference point used to obtain the new position.
// 		 * @throws {Error("I/O error")} An I/O error occurs.
// 		 * @throws {Error("The stream does not support seeking")} The stream does not support seeking, such as if the stream is constructed from a pipe or console output.
// 		 * @throws {Error("Object disposed")} Methods were called after the stream was disposed(closed).
// 		 */
// 		seek(offset: number, origin: SeekOrigin): Promise<void>;
// 		/**
// 		 * Writes a sequence of bytes to the current stream and advances the current position within this stream by the number of bytes written.
// 		 * @param buf An array of bytes. This method copies count bytes from buffer to the current stream.
// 		 * @param offset The zero-based byte offset in buffer at which to begin copying bytes to the current stream.
// 		 * @param count The number of bytes to be written to the current stream.
// 		 * @throws {Error("I/O error")} An I/O error occurs.
// 		 * @throws {Error("Not supported")} The stream does not support writing, such as if the stream is constructed from a console input.
// 		 * @throws {Error("Object disposed")} Methods were called after the stream was disposed(closed).
// 		 */
// 		write(buf: ArrayBuffer, offset?: number, count?: number): Promise<void>;
// 	}
// }

/*
 * 
 *  _____                              
 * | ____| _ __  _ __  ___   _ __  ___ 
 * |  _|  | '__|| '__|/ _ \ | '__|/ __|
 * | |___ | |   | |  | (_) || |   \__ \
 * |_____||_|   |_|   \___/ |_|   |___/
 * 
 */

export interface ArgumentError extends Error {
	readonly name: "ArgumentError";
}
export class AggregateError extends Error {
	readonly name: "AggregateError";
	readonly innerError: Error;
	readonly innerErrors: Array<Error>;
}
export interface CancelledError extends Error {
	readonly name: "CancelledError";
}
export interface InvalidOperationError extends Error {
	readonly name: "InvalidOperationError";
}
