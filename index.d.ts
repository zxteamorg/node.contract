export interface CancellationToken {
	readonly isCancellationRequested: boolean;
	addCancelListener(cb: Function): void;
	removeCancelListener(cb: Function): void;
	throwIfCancellationRequested(): void;
}

export interface Configuration {
	readonly configurationNamespace: string;
	get(key: string): boolean | number | string;
	getBase64(key: string, defaultValue?: Uint8Array): Uint8Array;
	getBoolean(key: string, defaultValue?: boolean): boolean;
	getConfiguration(configurationNamespace: string): Configuration;
	getEnabled(key: string, defaultValue?: boolean): boolean;
	getFloat(key: string, defaultValue?: number): number;
	getInteger(key: string, defaultValue?: number): number;
	getString(key: string, defaultValue?: string): string;
	getURL(key: string, defaultValue?: URL): URL;
	hasNamespace(configurationNamespace: string): boolean;
	has(key: string): boolean;
	hasNonEmpty(key: string): boolean;
	keys(): ReadonlyArray<string>;
}

export interface Disposable {
	dispose(): Promise<void>;
}

/**
 * EventChannel provides a channel to handle events asynchroniosly
 */
export interface EventChannel<TData, TEvent extends EventChannel.Event<TData> = EventChannel.Event<TData>> {
	addHandler(cb: EventChannel.Callback<TData, TEvent>): void;
	removeHandler(cb: EventChannel.Callback<TData, TEvent>): void;
}
export namespace EventChannel {
	export interface Event<TData> {
		readonly data: TData;
	}
	export interface Callback<TData, TEvent extends Event<TData> = Event<TData>> {
		(event: TEvent): void | Promise<void>;
	}
}

export interface Initable extends Disposable {
	init(cancellationToken: CancellationToken): Promise<this>;
}

/** Define some kind of a transport for RPC implementations */
export interface InvokeChannel<TIn = Uint8Array, TOut = Uint8Array> {
	invoke(cancellationToken: CancellationToken, args: TIn): Promise<TOut>;
}

/**
 * Represent financial amount type.
 */
export interface Financial {
	abs(): Financial;
	add(value: Financial): Financial;
	divide(value: Financial, fractionalDigits: Financial.FractionDigits, roundMode: Financial.RoundMode): Financial;
	equals(value: Financial): boolean;
	gt(value: Financial): boolean;
	gte(value: Financial): boolean;
	inverse(): Financial;
	isNegative(): boolean;
	isPositive(): boolean;
	isZero(): boolean;
	lt(value: Financial): boolean;
	lte(value: Financial): boolean;
	max(value: Financial): Financial;
	min(value: Financial): Financial;
	mod(value: Financial, fractionalDigits: Financial.FractionDigits, roundMode: Financial.RoundMode): Financial;
	multiply(value: Financial, fractionalDigits: Financial.FractionDigits, roundMode: Financial.RoundMode): Financial;
	round(fractionalDigits: Financial.FractionDigits, roundMode: Financial.RoundMode): Financial;
	subtract(value: Financial): Financial;
	toFloat(): number;
	toInt(): number;
	/**
	 * String representation of value
	 * RegExp: ^([+-]?)(0|[1-9][0-9]*)(\.([0-9]+))?$
	 */
	toString(): string;
}
export namespace Financial {
	export type FractionDigits = number;

	export const enum RoundMode {
		/**
		 * Round to the smallest Financial greater than or equal to a given Financial.
		 * In other words: Round UP
		 * Example of Ceil to fraction:2 
		 * 0.595 -> 0.60
		 * 0.555 -> 0.56
		 * 0.554 -> 0.56
		 * -0.595 -> -0.59
		 * -0.555 -> -0.55
		 * -0.554 -> -0.55
		 */
		Ceil = "Ceil",

		/**
		 * Round to the largest Financial less than or equal to a given Financial.
		 * In other words: Round DOWN
		 * Example of Floor to fraction:2 
		 * 0.595 -> 0.59
		 * 0.555 -> 0.55
		 * 0.554 -> 0.55
		 * -0.595 -> -0.60
		 * -0.555 -> -0.56
		 * -0.554 -> -0.56
		 */
		Floor = "Floor",

		/**
		 * Round to the Financial rounded to the nearest Financial.
		 * In other words: Round classic
		 * Example of Round to fraction:2 
		 * 0.595 -> 0.60
		 * 0.555 -> 0.56
		 * 0.554 -> 0.55
		 * -0.595 -> -0.60
		 * -0.555 -> -0.55
		 * -0.554 -> -0.55
		 */
		Round = "Round",

		/**
		 * Round to the Financial by removing fractional digits.
		 * Works same as Floor in positive range
		 * Works same as Ceil in negative range
		 * Example of Trunc to fraction:2 
		 * 0.595 -> 0.59
		 * 0.555 -> 0.55
		 * 0.554 -> 0.55
		 * -0.595 -> -0.59
		 * -0.555 -> -0.55
		 * -0.554 -> -0.55
		 */
		Trunc = "Trunc"
	}
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

	/**
	 * Get sub-logger that belong to this logger
	 * @param name Sub-logger name
	 * @param context Define context variables for object-based logger adapter. For example to be render to Kibana.
	 */
	getLogger(name?: string, context?: { readonly [name: string]: number | string | boolean }): Logger;
}

/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
export interface PublisherChannel<TData = Uint8Array> {
	send(cancellationToken: CancellationToken, data: TData): Promise<void>;
}

export interface Serializer<T, TSerial = ArrayBuffer> {
	/**
	 * Serialize an object to binary sequence.
	 * @param obj The object to be serialized.
	 */
	serialize(obj: T): TSerial;

	/**
	 * Deserialize an object.
	 * @param source The array buffer that contains bytes to deserialize.
	 */
	deserialize(source: TSerial): T;
}

/** Define some kind of Publish-Subscribe pattern. See https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern */
export interface SubscriberChannel<TData = Uint8Array, TEvent extends SubscriberChannel.Event<TData> = SubscriberChannel.Event<TData>> {
	addHandler(cb: SubscriberChannel.Callback<TData, TEvent>): void;
	removeHandler(cb: SubscriberChannel.Callback<TData, TEvent>): void;
}
export namespace SubscriberChannel {
	export interface Event<TData> {
		readonly data: TData;
	}
	export interface Callback<TData, TEvent extends Event<TData> = Event<TData>> {
		(event: TEvent | Error): void | Promise<void>;
	}
}
