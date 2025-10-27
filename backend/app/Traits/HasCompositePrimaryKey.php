<?php

namespace App\Traits;

trait HasCompositePrimaryKey
{
    /**
     * Override do método getKeyName para chave composta
     */
    public function getKeyName()
    {
        return $this->primaryKey;
    }

    /**
     * Override do método setKeysForSaveQuery para chave composta
     */
    protected function setKeysForSaveQuery($query)
    {
        $keys = $this->getKeyName();
        if (!is_array($keys)) {
            return parent::setKeysForSaveQuery($query);
        }

        foreach ($keys as $keyName) {
            $query->where($keyName, '=', $this->getKeyForSaveQuery($keyName));
        }

        return $query;
    }

    /**
     * Override do método getKeyForSaveQuery para chave composta
     */
    protected function getKeyForSaveQuery($keyName = null)
    {
        if (is_null($keyName)) {
            $keyName = $this->getKeyName();
        }

        if (isset($this->original[$keyName])) {
            return $this->original[$keyName];
        }

        return $this->getAttribute($keyName);
    }

    /**
     * Get the value indicating whether the IDs are incrementing.
     */
    public function getIncrementing()
    {
        return false;
    }
}
