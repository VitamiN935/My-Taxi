import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import {GoSearch} from "react-icons/go";
import {useAppSelector} from "@/hooks";
import cn from "classnames";
import {Direction, TLocation} from "@/types";
import {getFormatTravelTime} from "@/utils";
import AddressLoader from "@/components/ui/AddressLoader";


interface ISearchPlaceInput {
  type: Direction.FROM | Direction.TO,
  cbSelectedAddress: (address: string, location: TLocation) => void
}

const SearchPlaceInput: FC<ISearchPlaceInput> = ({type, cbSelectedAddress}) => {
  const {travelTime} = useAppSelector(state => state.taxi)
  const [address, setAddress] = useState<string>('')
  const isTo = type === Direction.TO
  const inputRef = useRef<HTMLInputElement>(null)

  const handlerSelectedAddress = useCallback(async (address: string) => {
    const results = await geocodeByAddress(address)
    const location = await getLatLng(results[0])
    setAddress(address)
    cbSelectedAddress(address, location)
  }, [setAddress])

  const inputFocus = () => inputRef?.current?.focus()

  useEffect(() => {
    if (!isTo) inputRef?.current?.focus()
  }, [])

  return (
    <PlacesAutocomplete
      value={address}
      onChange={setAddress}
      onSelect={handlerSelectedAddress}
    >
      {({getInputProps, getSuggestionItemProps, suggestions, loading}) => (
        <div className=" mb-5">
          <div className="rounded-md w-full shadow-md bg-white px-3 py-3 flex items-center"
               style={suggestions.length || loading ? {borderBottomRightRadius: 0, borderBottomLeftRadius: 0} : {}}
               onClick={inputFocus}
          >
            <GoSearch
              color={isTo ? '#000' : '#724B99'}
              size={20}
              className="mr-3 flex-shrink-0"
            />
            <input
              {...getInputProps({
                ref: inputRef,
                type: "text",
                placeholder: isTo ? 'Куда едем?' : 'Откуда?',
                className: 'w-full outline-none text-gray-900 font-medium pr-2'
              })}
            />
            {isTo && travelTime !== 0 &&
            <span className="text-gray-400 text-sm right-2 whitespace-nowrap">
              {getFormatTravelTime(travelTime)}
            </span>
            }
          </div>
          <div className={cn('bg-white absolute h-0 inset-x-0 overflow-y-auto z-20', {
            'h-48 p-2': loading || suggestions.length
          })}>
            {loading && <AddressLoader/>}
            {suggestions.map(suggestion => {
              const variantClass = cn({
                'bg-gray-300': suggestion.active,
                'bg-white p-2 cursor-pointer': true
              })
              return (
                <div
                  {...getSuggestionItemProps(suggestion, {className: variantClass})}
                  key={suggestion.placeId}
                >
                  <span className="text-xl">
                    {suggestion.description}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default React.memo(SearchPlaceInput);