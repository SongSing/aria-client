import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: flex;
    flex-direction: row;
    align-items: stretch;

    input.numberInput
    {
        &::-webkit-inner-spin-button
        {
            -webkit-appearance: none;
        }

        flex-grow: 1;
        min-width: 0;
    }

    .numberInput-buttons
    {
        display: flex;
        flex-direction: column;
        justify-content: stretch;

        button
        {
            padding: 2px 4px;
            font-size: 0.6em;
            flex-grow: 1;

            &:hover
            {
                background-color: white;
                color: black;
            }

            &:active
            {
                background-color: #ddd;
            }
        }
    }
`;

interface Props
{
    max?: number;
    min?: number;
    step?: number;
    onChange?: (value: number) => any;
    coerce?: (value: number) => number;
    roundPlaces?: number;
    value: number;
}

export default function NumberInput(props: Props)
{
    const [ savedValue, setSavedValue ] = useState<string | number>(props.value);
    const mouseIsDown = useRef<boolean>(false);
    const mouseDownTime = useRef<number>(0);
    const initialHoldTimeout = useRef<NodeJS.Timeout | null>(null);
    const holdInterval = useRef<NodeJS.Timeout | null>(null);
    const savedIncrement = useRef<Function>(() => 0);
    const savedDecrement = useRef<Function>(() => 0);

    function emitChange(value: number, autoPerformTransformations=true)
    {
        if (autoPerformTransformations)
        {
            value = performTransformations(value);
        }

        if (value !== props.value && props.onChange)
        {
            props.onChange(value);
        }
    }

    function performTransformations(value: number)
    {
        if (props.roundPlaces !== undefined && props.roundPlaces >= 0)
        {
            value = parseFloat(value.toFixed(props.roundPlaces));
            // const pow = Math.pow(10, Math.floor(props.roundPlaces));
            // return Math.round((value + Number.EPSILON) * pow) / pow;
        }

        if (props.coerce)
        {
            value = props.coerce(value);
        }

        return value;
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>)
    {
        let value = parseFloat(e.currentTarget.value);
        if (!isNaN(value))
        {
            value = performTransformations(value);
            emitChange(value, false);
            setSavedValue(value);
        }
        else
        {
            setSavedValue(e.currentTarget.value);
        }
    }

    useEffect(() =>
    {
        if (props.max !== undefined && props.value > props.max)
        {
            emitChange(props.max);
        }
    }, [ props.max ]);


    useEffect(() =>
    {
        if (props.min !== undefined && props.value < props.min)
        {
            emitChange(props.min);
        }
    }, [ props.min ]);

    useEffect(() =>
    {
        setSavedValue(props.value);
    }, [ props.value ]);

    function increment()
    {
        const step = props.step ?? 1;
        let value = props.value;

        value = props.value + step;
        
        if (props.step)
        {
            value = Math.round(value / props.step) * props.step;
        }

        if (props.max !== undefined && value > props.max)
        {
            value = props.max;
        }
        emitChange(value);
    }

    function decrement()
    {
        const step = props.step ?? 1;
        let value = props.value;

        value = props.value - step;
        
        if (props.step)
        {
            value = Math.round(value / props.step) * props.step;
        }

        if (props.min !== undefined && value < props.min)
        {
            value = props.min;
        }
        emitChange(value);
    }

    useEffect(() =>
    {
        savedIncrement.current = increment;
        savedDecrement.current = decrement;
    });

    function handleMouseDown(sign: 1 | -1)
    {
        const fn = sign === 1 ? savedIncrement : savedDecrement;
        mouseIsDown.current = true;
        fn.current();
        initialHoldTimeout.current = setTimeout(() =>
        {
            if (!mouseIsDown.current) return;

            holdInterval.current = setInterval(() =>
            {
                if (mouseIsDown.current)
                {
                    fn.current();
                }
            }, 40);
        }, 360);
    }

    function handleMouseUp()
    {
        mouseIsDown.current = false;
        if (initialHoldTimeout.current !== null)
        {
            clearTimeout(initialHoldTimeout.current);
            initialHoldTimeout.current = null;
        }
        if (holdInterval.current !== null)
        {
            clearInterval(holdInterval.current);
            holdInterval.current = null;
        }
    }

    function handleMouseLeave()
    {
        mouseIsDown.current = false;
        if (initialHoldTimeout.current !== null)
        {
            clearTimeout(initialHoldTimeout.current);
            initialHoldTimeout.current = null;
        }
        if (holdInterval.current !== null)
        {
            clearInterval(holdInterval.current);
            holdInterval.current = null;
        }
    }

    return (
        <Wrapper>
            <input
                className="numberInput"
                type="number"
                min={props.min}
                max={props.max}
                step={props.step}
                onChange={handleChange}
                value={savedValue}
            />
            <div className="numberInput-buttons">
                <button
                    className="numberInput-up"
                    // onClick={increment}
                    onMouseDown={() => handleMouseDown(1)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    ▲
                </button>
                <button
                    className="numberInput-down"
                    // onClick={decrement}
                    onMouseDown={() => handleMouseDown(-1)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    ▼
                </button>
            </div>
        </Wrapper>
    );
}
