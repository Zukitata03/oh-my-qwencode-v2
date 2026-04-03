export const MADMAX_FLAG = '--madmax';
export const QWEN_BYPASS_FLAG = '--approval-mode';
export const QWEN_BYPASS_VALUE = 'yolo';
export const HIGH_REASONING_FLAG = '--high';
export const XHIGH_REASONING_FLAG = '--xhigh';
export const SPARK_FLAG = '--spark';
export const MADMAX_SPARK_FLAG = '--madmax-spark';
export const CONFIG_FLAG = '-c';
export const LONG_CONFIG_FLAG = '--config';
export const MODEL_FLAG = '--model';

// Qwen Code 0.14.0+ no longer supports -c/--config, --high, --xhigh flags
// Users must configure model_reasoning_effort in ~/.qwen/settings.json instead
