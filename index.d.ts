export interface DisposableLike {
	dispose(): Promise<void>;
}

export interface InitableLike extends DisposableLike {
	init(): Promise<void>;
}

export interface Factory<T> {
	create(): Promise<T>;
}

/**
 * Represent financial amount type.
 * The value is presented as stringified integer value with number of fraction digits.
 * The type doesn't have any limit to digits count and doesn't vulnerable rounding precision.
 * @example 
 * const moneyAmount: FinancialLike = ...
 * const amount: number = parseInt(moneyAmount.value) / moneyAmount.fraction
 * // amount is number value of moneyAmount
 */
export interface FinancialLike {
	readonly value: string;
	readonly fraction: number;
}

export declare namespace collections {
	export interface EnumeratorLike<T> {
		reset(): void | Promise<void>;
		moveNext(): boolean | Promise<boolean>;
		getCurrent(): T | Promise<T>;
	}
	export interface EnumerableLike<T> {
		enumerator(): EnumeratorLike<T> | Promise<EnumeratorLike<T>>;
	}
}

export declare namespace configuration {
	interface ConfigurationLike {
		getBoolean(key: string, defaultValue?: boolean): boolean;
		getConfiguration(configurationNamespace: string): ConfigurationLike;
		getEnabled(key: string, defaultValue?: boolean): boolean;
		getFloat(key: string, defaultValue?: number): number;
		getInt(key: string, defaultValue?: number): number;
		getObject<T>(key: string, defaultValue?: T): T;
		getString(key: string, defaultValue?: string): string;
	}
}

export declare namespace communication {
	/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
	export interface PublisherLike<TProtocol> extends DisposableLike {
		send(data: TProtocol): Promise<void>;
	}
	/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
	export interface SubscriberLike<TProtocol> extends DisposableLike {
		/** The callback function reference.
		 * You can set null to the property to temporary disable notification.
		 * @param data Repesent data from a subscriber's backend or Error if the subscriber crashes.
		 * Note: after receive data as Error the subscriber destroyed and never call callback again.
		 */
		cb: ((data: TProtocol | Error) => void | Promise<void>) | null;
	}

	/** Define some kind of a transport for RPC implementations */
	export interface InvokeTransportLike<TIn, TOut> extends DisposableLike {
		invoke(data: TIn): Promise<TOut>;
	}

	export interface StreamTransportLike<TMetadata> extends DisposableLike {
		stream(data: TMetadata): Promise<io.StreamLike>;
	}
}

export declare namespace data {

	export namespace sql {
		export type SqlStatementParam = boolean | string | number | Date | Uint8Array
			| Array<string> | Array<number> | Array<Date> | Array<Uint8Array> | FinancialLike;

		// const enum SqlType {
		// 	BINARY,
		// 	BOOL,
		// 	DOUBLE,
		// 	INT8,
		// 	INT16,
		// 	INT32,
		// 	INT64,
		// 	UINT8,
		// 	UINT16,
		// 	UINT32,
		// 	UINT64
		// }

		export interface SqlValue {
			readonly asBoolean: boolean;
			readonly asNullableBoolean: boolean | null;
			readonly asString: string;
			readonly asNullableString: string | null;
			readonly asNumber: number;
			readonly asNullableNumber: number | null;
			readonly asFinancial: FinancialLike;
			readonly asNullableFinancial: FinancialLike | null;
			readonly asDate: Date;
			readonly asNullableDate: Date | null;
			readonly asBinary: Uint8Array;
			readonly asNullableBinary: Uint8Array | null;
		}

		export interface SqlProvider extends DisposableLike {
			statement(sql: string): SqlStatement;
		}

		export interface SqlProviderFactory extends Factory<SqlProvider> { }

		export interface SqlRow {
			[name: string]: SqlValue;
		}

		export interface SqlSet extends collections.EnumeratorLike<SqlRow>, DisposableLike {
		}

		export interface SqlStatement {
			param(value: SqlStatementParam): this;
			execute(): Promise<void>;
			executeTop(): Promise<SqlRow>;
			executeQuery(): Promise<SqlSet>;
			executeScalar(): Promise<SqlValue>;
		}
	}
}

export declare namespace io {
	export const enum SeekOrigin {
		Begin = -1,
		Current = 0,
		End = 1,
	}
	export interface StreamLike extends DisposableLike {
		/**
		 * Gets a value indicating whether the current stream supports reading.
		 */
		readonly isReadable: boolean;
		/**
		 * Gets a value indicating whether the current stream supports seeking.
		 */
		readonly isSeekable: boolean;
		/**
		 * Gets a value indicating whether the current stream supports writing.
		 */
		readonly isWriteable: boolean;
		/**
		 * Gets the position within the current stream.
		 */
		readonly position: number;
		/**
		 * Reads the bytes from the current stream and writes them to another stream.
		 * @param destination The stream to which the contents of the current stream will be copied.
		 * @throws {Error("Argument error")} destination is null or undefined.
		 * @throws {Error("I/O error")} An I/O error occurs.
		 * @throws {Error("Invalid operation")} The stream does not support seeking, such as if the stream is constructed from a pipe or console output.
		 * @throws {Error("Object disposed")} Methods were called after the stream was disposed(closed).
		 */
		copyTo(destination: StreamLike): Promise<void>;
		/**
		 * Reads a sequence of bytes from the current stream and advances the position
		 * within the stream by the number of bytes read.
		 * @param buf An array of bytes. When this method returns,
		 * the buffer contains the specified byte array with the values between offset
		 * and (offset + count - 1) replaced by the bytes read from the current source.
		 * @param  The zero-based byte offset in buffer at which to begin storing the data read from the current stream.
		 * @returns The total number of bytes read into the buffer. This can be less than the number of bytes requested
		 * if that many bytes are not currently available, or zero (0) if the end of the stream has been reached.
		 * @throws {Error("I/O error")} An I/O error occurs.
		 * @throws {Error("Invalid operation")} The stream does not support reading, such as if the stream is constructed from a console output.
		 * @throws {Error("Object disposed")} Methods were called after the stream was disposed(closed).
		 */
		read(buf: ArrayBuffer, offset?: number, count?: number): Promise<number>;
		/**
		 * Sets the position within the current stream.
		 * @param offset A byte offset relative to the origin parameter.
		 * @param origin A value of type SeekOrigin indicating the reference point used to obtain the new position.
		 * @throws {Error("I/O error")} An I/O error occurs.
		 * @throws {Error("The stream does not support seeking")} The stream does not support seeking, such as if the stream is constructed from a pipe or console output.
		 * @throws {Error("Object disposed")} Methods were called after the stream was disposed(closed).
		 */
		seek(offset: number, origin: SeekOrigin): Promise<void>;
		/**
		 * Writes a sequence of bytes to the current stream and advances the current position within this stream by the number of bytes written.
		 * @param buf An array of bytes. This method copies count bytes from buffer to the current stream.
		 * @param offset The zero-based byte offset in buffer at which to begin copying bytes to the current stream.
		 * @param count The number of bytes to be written to the current stream.
		 * @throws {Error("I/O error")} An I/O error occurs.
		 * @throws {Error("Not supported")} The stream does not support writing, such as if the stream is constructed from a console input.
		 * @throws {Error("Object disposed")} Methods were called after the stream was disposed(closed).
		 */
		write(buf: ArrayBuffer, offset?: number, count?: number): Promise<void>;
	}
}

export declare namespace log {
	export interface LoggerLike {
		isTraceEnabled(): boolean;
		isDebugEnabled(): boolean;
		isInfoEnabled(): boolean;
		isWarnEnabled(): boolean;
		isErrorEnabled(): boolean;
		isFatalEnabled(): boolean;

		trace(message: string, ...args: any[]): void;
		debug(message: string, ...args: any[]): void;
		info(message: string, ...args: any[]): void;
		warn(message: string, ...args: any[]): void;
		error(message: string, ...args: any[]): void;
		fatal(message: string, ...args: any[]): void;
	}
}

export declare namespace serialization {
	export interface BinarySerializer<T> {
		/**
		 * Serialize an object to binary sequence.
		 * @param obj The object to be serialized.
		 */
		serializeToBinary(obj: T): ArrayBuffer;

		/**
		 * Deserialize an object.
		 * @param source The array buffer that contains bytes to deserialize.
		 */
		deserializeFromBinary(source: ArrayBuffer): T;
	}
	export interface SerializerLike<T> {
		/**
		 * Serialization is the process of representing an object to binary sequence.
		 * @param obj The object to be serialized.
		 * @param target The target IStream for write binary representation.
		 * @throws {Error("Invalid operation")} An error occurred during serialization. The original exception is available using the innerException property.
		 */
		serializeToStream(obj: T, target: io.StreamLike): Promise<void>;

		/**
		 * Deserialization is the process of reading bytes from IStream
		 * and constructing an object.
		 * @param source The IStream that contains bytes to deserialize.
		 * @throws {Error("Invalid operation")} An error occurred during serialization. The original exception is available using the innerException property.
		 */
		deserializeFromStream(source: io.StreamLike): Promise<T>;
	}
}
